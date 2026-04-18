/**
 * 詳細画面のモード
 * - new: マスタ新規登録
 * - view: マスタ・適用終了日ともに照会・承認モード
 *
 * 実装上、権限と登録ステータスで照会・承認モードを判別可能であり、コードが複雑になることを避けるためviewで統一
 * - edit: マスタの編集モード 適用終了日は参照モード
 * - applicableEdit: 適用終了日情報が編集モード マスタは参照モード
 * - refNewEdit: 参照新規登録モード
 */
export type Mode = 'new' | 'view' | 'edit' | 'applicableEdit' | 'refNewEdit';
