// -----------------------------create----------------------------------

export const create = async ({
    model,
    data,
    options={}
}) => {
    return await model.create(data, options);
};

// -----------------------------updateOne----------------------------------
export const updateOne = async ({
    filter,
    update,
    options,
    model
} = {}) => {
    return await model.updateOne(
        filter || {},
        { ...update, $inc: { _v: 1 } },
        options
    );
};

// -----------------------------deleteOne----------------------------------

export const deleteOne = async ({
    filter,
    model
}) => {
    return await model.deleteOne(filter || {});
};

// -----------------------------deleteMany----------------------------------

export const deleteMany = async ({
    filter,
    model
}) => {
    return await model.deleteMany(filter || {});
};


// -----------------------------find----------------------------------
export const find = async ({
    filter,
    options = {},
    select,
    model } = {}) => {

    const doc = model.find(filter || {}).select(select || "");

    if (options.populate) {
        doc.populate(options.populate);
    }

    if (options.skip) {
        doc.skip(options.skip);
    }

    if (options.limit) {
        doc.limit(options.limit);
    }

    if (options.lean) {
        doc.lean(options.lean);
    }

    return await doc.exec();
};

// -----------------------------findById----------------------------------

export const findById = async ({ id, options = {}, select = {}, model }) => {
    const doc = model.findById(id).select(select || "");

    if (options.populate) {
        doc.populate(options.populate);
    }

    if (options.lean) {
        doc.lean(options.lean);
    }

    return await doc.exec();
};

// -----------------------------findOne----------------------------------

export const findOne = async ({
    model,
    select = " ",
    filter = {},
    options = {},
} = {}) => {
    const doc = model.findOne(filter);
    if (select.length) {
        doc.select(select);
    }
    if (options.populate) {
        doc.populate(populate);
    }
    if (options.lean) {
        doc.lean();
    }
    return await doc.exec();
};



