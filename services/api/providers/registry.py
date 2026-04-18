from . import stripe
from . import github
from . import razorpay
from . import shopify
from . import slack
from . import discord
from . import notion
from . import supabase


# Registry of supported webhook providers.
#
# Each provider module is expected to implement:
# - verify(request, secret/public_key) -> bool
# - extract_event_type(payload) -> str
# - handle_<provider>_webhook(payload, headers) -> dict
#
# This mapping is used to dynamically route incoming webhook requests
# to the correct provider-specific logic based on provider name.
PROVIDERS = {
    "stripe": stripe,
    "github": github,
    "razorpay": razorpay,
    "shopify": shopify,
    "slack": slack,
    "discord": discord,
    "notion": notion,
    "supabase": supabase,
}