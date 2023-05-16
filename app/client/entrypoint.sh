if [ ! -f "/app/save/.prod" ]
then
	npm run build \
	&& cp /app/nginx-reverse-proxy/default.conf /etc/nginx/http.d/. \
	&& cp -r /app/dist /var/www/html  \
	&& cp -r /app/dist/* /app/save/. \
	&& touch /app/save/.prod
#	cp /app/nginx-reverse-proxy/default.conf.template /etc/nginx/templates/default.conf.template
else
	cp /app/nginx-reverse-proxy/default.conf /etc/nginx/http.d/.
	cp -r /app/save /var/www/html
fi
nginx -g 'daemon off;'
