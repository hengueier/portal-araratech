import { v4 as uuidv4 } from "uuid";
import mongoose, {
  Schema,
  Document,
  Model as MongooseModel,
  SchemaDefinition,
  FilterQuery,
  UpdateQuery,
  ProjectionType,
  UpdateWriteOpResult,
  SortOrder,
} from "mongoose";
import MongoBuilder from "../../helper/MongoBuilder";

type PlainDocument<T> = Omit<T, keyof Document>;

export default abstract class Model<T extends Document> {
  protected model: MongooseModel<T>;

  constructor(
    schema: SchemaDefinition<T>,
    modelName: string,
    timestamps = false,
  ) {
    const model = mongoose.model<T>(
      modelName,
      new Schema<T>(schema, { timestamps }),
      modelName.toLowerCase(),
    );
    this.model = model;
  }

  public create: {
    new: (document: PlainDocument<T>) => Promise<T>;
    batch: (
      documents: Array<PlainDocument<T>>,
      ordered: boolean,
      accountId?: string,
    ) => Promise<Array<T>>;
  } = {
    new: async (document, id = uuidv4()) => {
      return await this.model.create({ id, ...document });
    },

    batch: async (documents, ordered = false, accountId = null) => {
      const documentsWithId = documents.map((document) => ({
        account_id: accountId,
        id: uuidv4(),
        ...document,
      }));

      return await this.model.insertMany(documentsWithId, { ordered });
    },
  };

  public read: {
    all: (
      query?: FilterQuery<T>,
      projection?: ProjectionType<T>,
      sort?: { [key: string]: SortOrder },
    ) => Promise<Array<T>>;
    one: (
      query: FilterQuery<T>,
      projection?: ProjectionType<T>,
    ) => Promise<T | null>;
    paginate: (
      query: FilterQuery<T>,
      limit: number,
      page: number,
    ) => Promise<T | null>;
    search: (
      options: { filter: string; fields: string[] },
      accountId: string,
      limit?: number,
    ) => Promise<Array<T>>;
  } = {
    all: async (query = {}, projection = {}, sort = {}) => {
      return await this.model.find(query, projection).sort(sort);
    },
    one: async (query, projection = {}) => {
      return await this.model.findOne(query, projection);
    },
    paginate: async (query, limit, page) => {
      const mongo = new MongoBuilder(this.model).match(query);
      await mongo.addPagination(page, limit);
      await mongo.run();
      return await mongo.results();
    },

    search: async (
      options: { filter: string; fields: string[] },
      accountId: string,
      limit = 10,
    ) => {
      try {
        const { filter, fields } = options;

        if (!filter || filter.trim().length === 0) {
          throw new Error("Search filter must be provided.");
        }

        if (!fields || fields.length === 0) {
          throw new Error("Search fields must be provided.");
        }

        const regex = new RegExp(filter, "i");

        const searchConditions: any = fields.map((field) => ({
          [field]: regex,
        })) as Array<Partial<T>>;

        const results = await this.model
          .find({
            account_id: accountId,
            $or: searchConditions,
          })
          .limit(limit);

        return results;
      } catch (error) {
        console.error("Error in search function:", error);
        throw new Error("Search function failed.");
      }
    },
  };

  public update: {
    one: (
      query: FilterQuery<T>,
      update: UpdateQuery<T>,
      opts?: { upsert?: boolean; new?: boolean },
    ) => Promise<T>;

    many: (
      query: FilterQuery<T>,
      update: UpdateQuery<T>,
    ) => Promise<UpdateWriteOpResult>;
  } = {
    one: async (query, update, opts = {}) => {
      return this.model.findOneAndUpdate(query, update, opts);
    },
    many: async (query, update) => {
      return this.model.updateMany(query, update);
    },
  };

  public delete: {
    one: (query: FilterQuery<T>) => Promise<any>;
    many: (query: FilterQuery<T>) => Promise<any>;
  } = {
    one: async (query) => {
      return this.model.deleteOne(query);
    },
    many: async (query) => {
      return this.model.deleteMany(query);
    },
  };

  public custom:
    | {
        create: { [key: string]: (...args: any[]) => Promise<any> };
        read: { [key: string]: (...args: any[]) => Promise<any> };
        update: { [key: string]: (...args: any[]) => Promise<any> };
        delete: { [key: string]: (...args: any[]) => Promise<any> };
      }
    | {} = {};
}
