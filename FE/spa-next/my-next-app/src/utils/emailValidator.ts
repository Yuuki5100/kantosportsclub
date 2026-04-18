/**
 * メールアドレスのフォーマットをチェックする関数
 *
 * @param email バリデーションを行うメールアドレス
 * @returns メールアドレスが有効な場合はtrue、そうでない場合はfalseを返す
 */
export const validateEmail = (email: string): boolean => {
  // 基本的なメールアドレスのパターン
  // ローカル部@ドメイン部の形式
  // ローカル部は英数字、ドット、ハイフン、アンダースコアを許可
  // ドメイン部は英数字、ドット、ハイフンを許可し、少なくとも1つのドットを含む
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[^.][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) {
    return false;
  }

  return emailRegex.test(email);
};
