import Model from "../Model";
import { IPreviewDocument } from "./IPreview";

export class Preview extends Model<IPreviewDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        account_id: { type: String, required: true },
      },
      "Preview",
      false,
    );
  }

  public custom = {
    create: {},
    read: {},
    update: {},
    delete: {},
  };
}
