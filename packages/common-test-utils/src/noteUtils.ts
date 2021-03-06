import {
  DVault,
  genUUID,
  NotePropsV2,
  NoteUtilsV2,
  SchemaModulePropsV2,
  SchemaUtilsV2,
} from "@dendronhq/common-all";
import {
  note2File,
  resolvePath,
  schemaModuleProps2File,
} from "@dendronhq/common-server";
import _ from "lodash";

export type CreateNoteOptsV4 = {
  vault: DVault;
  wsRoot: string;
  fname: string;
  body?: string;
  props?: Partial<Omit<NotePropsV2, "vault|fname|body">>;
  genRandomId?: boolean;
  noWrite?: boolean;
};

export type CreateSchemaOptsV4 = {
  vault: DVault;
  wsRoot: string;
  fname: string;
  noWrite?: boolean;
  modifier?: (schema: SchemaModulePropsV2) => SchemaModulePropsV2;
};

export class NoteTestUtilsV4 {
  static createSchema = async (opts: CreateSchemaOptsV4) => {
    const { fname, vault, noWrite, wsRoot } = _.defaults(opts, {
      noWrite: false,
    });

    let schema = SchemaUtilsV2.createModuleProps({ fname, vault });
    if (opts.modifier) {
      schema = opts.modifier(schema);
    }
    if (!noWrite) {
      const vpath = resolvePath(vault.fsPath, wsRoot);
      await schemaModuleProps2File(schema, vpath, fname);
    }
    return schema;
  };

  static createNote = async (opts: CreateNoteOptsV4) => {
    const {
      fname,
      vault,
      props,
      body,
      genRandomId,
      noWrite,
      wsRoot,
    } = _.defaults(opts, { noWrite: false });
    /**
     * Make sure snapshots stay consistent
     */
    const defaultOpts = {
      created: "1",
      updated: "1",
      id: genRandomId ? genUUID() : fname,
    };

    const note = NoteUtilsV2.create({
      ...defaultOpts,
      ...props,
      fname,
      vault,
      body,
    });
    if (!noWrite) {
      await note2File({ note, vault, wsRoot });
    }
    return note;
  };
}
