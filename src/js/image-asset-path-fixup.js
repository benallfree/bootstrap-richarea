// Fix up default asset paths
for(let layout_id in options.layouts)
{
  let layout = options.layouts[layout_id];
  for(let field_key in layout.fields)
  {
    let field = layout.fields[field_key];
    if(field.editor=='image')
    {
      field.defaultValue.originalImage = options.assetRoot + field.defaultValue.originalImage;
      field.defaultValue.croppedImage = options.assetRoot + field.defaultValue.croppedImage;
    }
  }
}