function route(handle, pathname, response, postData, params) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, postData, params);
	} else {
		handle["/file"](response, pathname);
	}
}

exports.route = route;