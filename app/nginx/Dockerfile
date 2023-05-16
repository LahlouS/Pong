FROM	nginx:alpine

COPY	./default.conf /etc/nginx/conf.d/.
#COPY	./default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
