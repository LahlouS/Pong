# =========== Production ===========

FROM		alpine:latest

RUN			apk add --update npm \
			&& apk add nginx

#RUN		npm install -g npm@latest

WORKDIR		/app
COPY		. /app/

RUN			npm ci

EXPOSE 8080

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
