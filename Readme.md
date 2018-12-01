api文档地址: https://www.showdoc.cc/213614315720649?page_id=1225321377843297


基于nginx、 express在linux服务器上搭建node服务器


我自己用的是mac 所以按照阿里云的文档可以很方便的ssh连接服务器，
windows的同学建议用xshell


在linux上先搭建node、nginx、mongo环境（阿里云的文档很丰富）


因为要开多个shell 所以建议用screen进行管理，
https://www.cnblogs.com/mchina/archive/2013/01/30/2880680.html


nginx主要用于做静态文件服务器和反向代理（请求转发），
我们只需要开放服务器的80端口（即缺省端口），然后用nginx将请求代理到我们node服务器的端口上，
如果存在跨域（CORS）的问题，可以在nginx上处理
