FROM phusion/baseimage

# Install dependency packages
RUN apt-get clean && apt-get update && apt-get install -y apt-utils python3 python3-dev python3-pip build-essential \
    python3-nose libpq-dev python3-psycopg2 postgresql-client-9.5

WORKDIR /api
COPY requirements.txt /api/requirements.txt
RUN pip3 install -r requirements.txt
COPY . /api
RUN export PYTHONPATH=/api
