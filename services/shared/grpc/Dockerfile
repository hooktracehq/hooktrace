FROM python:3.12-slim

WORKDIR /app

COPY services/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY services ./services

EXPOSE 50051

CMD ["python", "-m", "services.shared.grpc.server"]