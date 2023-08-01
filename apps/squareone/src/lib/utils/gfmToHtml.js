import remark from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

export default async function gfmToHtml(markdown) {
  const result = await remark().use(gfm).use(html).process(markdown);
  return result.toString();
}
