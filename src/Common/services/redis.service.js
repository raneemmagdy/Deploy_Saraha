import { redisClient } from "../../DB/redis.connection.db.js";
import { TypeRedisKeyEnum } from "../enum/redis.enum.js";
// -----------------------------keys----------------------------------
// -----------------------------RevokeToken
//-------Base
export const baseRevokeTokenKey = (userId) => {
    return `RevokeToken::${userId}`
}
//-------Base+Jti
export const revokeTokenKey = ({ userId, jti } = {}) => {
    return `${baseRevokeTokenKey(userId)}::${jti}`
}

// -----------------------------OTP
//-------Otp Key
export const otpKey = ({email, type=TypeRedisKeyEnum.ConfirmEmail}) => {
    return `OTP::User::${type}::${email}`
}
//-------Otp Max Request
export const otpMaxRequestKey = ({email, type=TypeRedisKeyEnum.ConfirmEmail}) => {
    return `OTP::User::MaxRequest::${type}::${email}`
}
//-------Otp Block
export const blockKey = ({email, type=TypeRedisKeyEnum.ConfirmEmail}) => {
    return `User::Block::${type}::${email}`
}

// -----------------------------Set Key
export const set = async ({
    key,
    value,
    ttl
} = {}) => {
    try {
        let data = typeof value === 'string' ? value : JSON.stringify(value)
        return ttl ? await redisClient.set(key, data, { EX: ttl }) : await redisClient.set(key, data)
    } catch (error) {
        console.log(`Fail in redis set operation ${error}`);
    }
};



// -----------------------------Update Key
export const update = async ({
    key,
    value,
    ttl
} = {}) => {
    try {
        if (!await redisClient.exists(key)) return 0;
        return await set({ key, value, ttl })
    } catch (error) {
        console.log(`Fail in redis update operation ${error}`);
    }
};

// -----------------------------Increment
export const increment = async (key) => {
    try {
        if (!await redisClient.exists(key)) {
            return 0;
        }
        return redisClient.incr(key)
    } catch (error) {
        console.log(`Fail to increment this operation`);

    }
};

// -----------------------------Get
export const get = async (key) => {
    try {

        try {
            return JSON.parse(await redisClient.get(key))
        } catch (error) {
            return await redisClient.get(key)
        }

    } catch (error) {
        console.log(`Fail in redis get operation ${error}`);
    }
};

// -----------------------------TTL
export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log(`Fail in redis ttl operation ${error}`);
    }
};

// -----------------------------Exists
export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log(`Fail in redis exists operation ${error}`);
    }
};
// -----------------------------Expire
export const expire = async ({
    key,
    ttl
} = {}) => {
    try {
        return await redisClient.expire(key, ttl)
    } catch (error) {
        console.log(`Fail in redis add-expire operation ${error}`);
    }
};
// -----------------------------MGet
export const mGet = async (keys = []) => {
    try {
        if (!keys.length) return 0;
        return await redisClient.mGet(keys)
    } catch (error) {
        console.log(`Fail in redis mGet operation ${error}`);
    }
};

// -----------------------------Keys
export const keysByPrefix = async (prefix) => {
    try {
        return await redisClient.keys(`${prefix}*`)
    } catch (error) {
        console.log(`Fail in redis keys operation ${error}`);
    }
};


// -----------------------------Delete
export const deleteKey = async (key) => {
    try {
        if (!key.length) return 0;
        return await redisClient.del(key)
    } catch (error) {
        console.log(`Fail in redis delete operation ${error}`);
    }
};