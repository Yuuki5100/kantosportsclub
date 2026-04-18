export const deleteFlgText = (deleteFlg?: boolean): 'YES' | 'NO' | '' => {
  if (deleteFlg === undefined) {
    return '';
  }
  return deleteFlg ? 'YES' : 'NO';
};
