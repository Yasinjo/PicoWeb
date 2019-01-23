export default function objectDataToFormData(objectData) {
  const data = new FormData();
  const keys = Object.keys(objectData);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (Array.isArray(objectData[key])) {
      for (let j = 0; j < objectData[key].length; j += 1) {
        data.append(key, objectData[key][j]);
      }
    } else { data.append(key, objectData[key]); }
  }

  return data;
}
