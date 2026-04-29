const notFound = (_req, res) => {
    return res.status(404).json({ error: { message: 'Route not found' } });
};

const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || res.statusCode || 500;
    return res.status(statusCode >= 400 ? statusCode : 500).json({
        error: { message: err.message || 'Internal server error' }
    });
};

const normalizeErrorResponse = (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 400 && body && body.error === undefined) {
            const message = body.message || body.toString?.() || 'Request failed';
            return originalJson({ error: { message } });
        }
        return originalJson(body);
    };
    next();
};

module.exports = { notFound, errorHandler, normalizeErrorResponse };
