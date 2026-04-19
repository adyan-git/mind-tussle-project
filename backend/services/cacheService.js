// Dummy cache service that bypasses caching and effectively forces direct queries to MongoDB

const get = async (key) => {
    return null;
};

const set = async (key, value, expiration = 3600) => {
    return "OK";
};

const del = async (key) => {
    return 0;
};

const clearCache = async (key) => {
    return 0;
};

const flushAll = async () => {
    return "OK";
};

const delByPattern = async (pattern) => {
    return 0;
};

export default {
    get,
    set,
    del,
    clearCache,
    flushAll,
    delByPattern,
};

