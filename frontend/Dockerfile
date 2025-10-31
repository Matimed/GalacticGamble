FROM nginx:alpine

COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf /etc/nginx/nginx.conf
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]