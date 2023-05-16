#!/bin/sh
if [ ! -d "/app/prisma/migrations" ]
then
#	npx prisma migrate deploy
	npx prisma migrate dev --name init \
	&& npx prisma generate \
	&& npm run build
	cp -r /app/dist/* /app/save/. &
	node dist/main.js
else
	npx prisma generate \
	&& node save/main.js
fi
