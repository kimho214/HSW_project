#!/usr/bin/env bash
# Render에서 Flask-SocketIO 앱을 실행하기 위한 스크립트

echo "--- Starting Flask-SocketIO server with Gunicorn + eventlet ---"

# eventlet worker를 사용하여 SocketIO 지원
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT main:app
