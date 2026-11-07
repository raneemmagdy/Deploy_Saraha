//==============================================create==============================

export const create = async ({ model, data = [], options = {} } = {}) => {
  return await model.create(data, options);
};

//==============================================createOne==============================
export const createOne = async ({ model, data, options = {} } = {}) => {
  const [doc] = (await model.create([data], options)) || [];
  return doc;
};
//==============================================findOne==============================
export const findOne = async ({ filter = {}, options = {}, model } = {}) => {
  const doc = model.findOne(filter);
  if (options.select) {
    doc.select(options.select);
  }
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }

  return await doc.exec();
};

//==============================================findById==============================
export const findById = async ({ id, options = {}, model } = {}) => {
  const doc = model.findById(id);

  if (options.select) {
    doc.select(options.select);
  }
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean(options.lean);
  }

  return await doc.exec();
};

//==============================================find==============================
export const find = async ({ filter = {}, options = {}, model } = {}) => {
  const doc = model.find(filter);

  if (options.select) {
    doc.select(options.select);
  }
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.skip) {
    doc.skip(options.skip);
  }
  if (options.limit) {
    doc.limit(options.limit);
  }

  return await doc.exec();
};

//==============================================update==============================
export const updateOne = async ({ filter, update, options, model } = {}) => {
  return await model.updateOne(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    options,
  );
};

export const updateMany = async ({
  model,
  filter = {},
  data = {},
  options = {},
} = {}) => {
  return await model.updateMany(filter, data, options);
};

export const findOneAndUpdate = async ({
  filter,
  update,
  options,
  model,
} = {}) => {
  return await model.findOneAndUpdate(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    {
      new: true,
      runValidators: true,
      ...options,
    },
  );
};

export const findByIdAndUpdate = async ({
  id,
  update,
  options = { new: true },
  model,
}) => {
  return await model.findByIdAndUpdate(
    id,
    { ...update, $inc: { __v: 1 } },
    options,
  );
};
//==============================================delete==============================
export const deleteOne = async ({ filter, model }) => {
  return await model.deleteOne(filter || {});
};

export const deleteMany = async ({ filter, model }) => {
  return await model.deleteMany(filter || {});
};

export const findOneAndDelete = async ({ filter, model } = {}) => {
  return await model.findOneAndDelete(filter || {});
};
