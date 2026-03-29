# services/workers/delivery_targets_router.py
"""
Routes incoming webhooks to configured delivery targets
Integrates with your existing delivery workers
"""

from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import text

from database import SessionLocal


class DeliveryTargetsRouter:
    """
    Routes webhooks to delivery targets based on configuration
    """
    
    def __init__(self):
        self.workers = {}
        self._load_workers()
    
    def _load_workers(self):
        """Lazy load delivery workers"""
        try:
            from services.workers.delivery.http import deliver_http
            self.workers['http'] = deliver_http
        except ImportError:
            pass
        
        try:
            from services.workers.delivery.sqs import deliver_sqs
            self.workers['sqs'] = deliver_sqs
        except ImportError:
            pass
        
        try:
            from services.workers.delivery.kafka import deliver_kafka
            self.workers['kafka'] = deliver_kafka
        except ImportError:
            pass
        
        try:
            from services.workers.delivery.rabbitmq import deliver_rabbitmq
            self.workers['rabbitmq'] = deliver_rabbitmq
        except ImportError:
            pass
        
        try:
            from services.workers.delivery.redis import deliver_redis
            self.workers['redis'] = deliver_redis
        except ImportError:
            pass
        
        try:
            from services.workers.delivery.grpc import deliver_grpc
            self.workers['grpc'] = deliver_grpc
        except ImportError:
            pass
    
    def get_active_targets(self, user_id: str, provider: str = None) -> List[Dict[str, Any]]:
        """
        Get all active delivery targets for a user
        Optionally filter by provider
        """
        db = SessionLocal()
        try:
            query = """
                SELECT id, type, config, providers
                FROM delivery_targets
                WHERE user_id = :user_id 
                AND enabled = TRUE
            """
            params = {"user_id": user_id}
            
            targets = db.execute(text(query), params).fetchall()
            
            # Filter by provider if specified
            filtered_targets = []
            for target in targets:
                target_providers = target[3] if target[3] else []
                
                # If target has no provider filter, it accepts all providers
                # If target has provider filter, check if current provider matches
                if not target_providers or not provider or provider in target_providers:
                    filtered_targets.append({
                        'id': str(target[0]),
                        'type': target[1],
                        'config': target[2],
                        'providers': target_providers,
                    })
            
            return filtered_targets
        finally:
            db.close()
    
    def deliver_webhook(
        self,
        user_id: str,
        webhook_data: Dict[str, Any],
        provider: str = None
    ) -> Dict[str, Any]:
        """
        Deliver webhook to all matching delivery targets
        
        Args:
            user_id: User who owns the targets
            webhook_data: Webhook payload to deliver
            provider: Provider name (e.g., 'stripe', 'github')
        
        Returns:
            Dictionary with delivery results
        """
        targets = self.get_active_targets(user_id, provider)
        
        results = {
            'total_targets': len(targets),
            'successful': 0,
            'failed': 0,
            'details': []
        }
        
        if not targets:
            return results
        
        # Deliver to each target
        for target in targets:
            target_id = target['id']
            target_type = target['type']
            config = target['config']
            
            try:
                # Get the appropriate worker
                worker = self.workers.get(target_type)
                
                if not worker:
                    results['failed'] += 1
                    results['details'].append({
                        'target_id': target_id,
                        'target_type': target_type,
                        'success': False,
                        'error': f'No worker found for type: {target_type}'
                    })
                    self._update_target_stats(target_id, success=False)
                    continue
                
                # Deliver using the worker
                result = worker(config, webhook_data)
                
                results['successful'] += 1
                results['details'].append({
                    'target_id': target_id,
                    'target_type': target_type,
                    'success': True,
                    'result': result
                })
                self._update_target_stats(target_id, success=True)
                
            except Exception as e:
                results['failed'] += 1
                results['details'].append({
                    'target_id': target_id,
                    'target_type': target_type,
                    'success': False,
                    'error': str(e)
                })
                self._update_target_stats(target_id, success=False)
        
        return results
    
    def _update_target_stats(self, target_id: str, success: bool):
        """Update delivery statistics for a target"""
        db = SessionLocal()
        try:
            if success:
                db.execute(
                    text("""
                        UPDATE delivery_targets
                        SET success_count = success_count + 1,
                            last_used = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": target_id}
                )
            else:
                db.execute(
                    text("""
                        UPDATE delivery_targets
                        SET error_count = error_count + 1,
                            last_used = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": target_id}
                )
            db.commit()
        except Exception as e:
            print(f"Error updating target stats: {e}")
        finally:
            db.close()


# Global instance
delivery_router = DeliveryTargetsRouter()


# Helper function for easy integration
def route_webhook_to_targets(
    user_id: str,
    webhook_data: Dict[str, Any],
    provider: str = None
) -> Dict[str, Any]:
    """
    Convenience function to route webhook to delivery targets
    
    Usage:
        from services.workers.delivery_targets_router import route_webhook_to_targets
        
        result = route_webhook_to_targets(
            user_id="user-123",
            webhook_data={"event": "payment_intent.succeeded", ...},
            provider="stripe"
        )
    """
    return delivery_router.deliver_webhook(user_id, webhook_data, provider)