// @flow

import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';

import EditorPlugins from './EditorPlugins';
import EditorSchema from './EditorSchema';
import createEmptyEditorState from './createEmptyEditorState';

export default function convertFromJSON(
  json: Object | string,
  schema: ?Schema,
  plugins: ?Array<Plugin>
): EditorState {

  let editorSchema = schema || EditorSchema;

  // [FS][IRAD-???? 2020-08-17]
  // Loads plugins and its curresponding schema in editor
  let effectivePlugins = EditorPlugins;
  if (plugins) {
    for (let p of plugins) {
      if (!effectivePlugins.includes(p)) {
        effectivePlugins.push(p);
        if (p.getEffectiveSchema) {
          editorSchema = p.getEffectiveSchema(editorSchema);
        }
      }
    }
  }
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (ex) {
      console.error('convertFromJSON:', ex);
      return createEmptyEditorState(schema, plugins);
    }
  }

  if (!json || typeof json !== 'object') {
    console.error('convertFromJSON: invalid object', json);
    return createEmptyEditorState(schema, plugins);
  }

  // [FS] IRAD-1067 2020-09-19
  // Handle gracefully when error thrown on invalid json
  let doc = null;
  
  try {
    doc = editorSchema.nodeFromJSON(json);
  } catch (error) {
    return null;
  }

  return EditorState.create({
    doc: doc,
    schema: editorSchema,
    plugins: effectivePlugins,
  });
}
