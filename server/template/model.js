import { v4 as uuidv4 } from "uuid";
import mongoose, {Schema} from "mongoose";

const {{capitalisedName}}Schema = new Schema({

  account_id: { type: String, required: true },

});

const {{capitalisedName}} = mongoose.model('{{capitalisedName}}', {{capitalisedName}}Schema, '{{view}}');
export const schema = {{capitalisedName}};

export const create = async function(data, account){

  const {{view}} = new {{capitalisedName}}({

    id: uuidv4(),
    account_id: account,

  });

  data = await {{view}}.save();
  return data.id;

}

export const get = async function(id, account){

  return await {{capitalisedName}}.find({

    ...id && { id: id },
    account_id: account

  });
}

export const update = async function(id, data, account){

  await {{capitalisedName}}.findOneAndUpdate({ id: id, account_id: account }, data);
  return data;

}

  await {{capitalisedName}}.findOneAndRemove({ id: id });
  return id;

}
