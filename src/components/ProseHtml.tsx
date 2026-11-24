type Props = {
  html: string;
  class?: string;
};

/** 构建期 Markdown HTML 注入 */
export default function ProseHtml(props: Props) {
  return (
    <div
      class={['hw-prose', props.class]}
      // 内容来自本站构建期 Markdown，非用户输入
      // oxlint-disable-next-line solid/no-innerhtml
      innerHTML={props.html}
    />
  );
}
