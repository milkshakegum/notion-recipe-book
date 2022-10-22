import React from "react";
import debug from "debug";
import { Block as BlockType, TableRowBlock } from "@notion-cms/types";

import Bookmark from "./components/Bookmark";
import Callout from "./components/Callout";
import RTO from "./RTO";
import Toggle from "./components/Toggle";
import Column from "./components/Column";
import { Blocks } from ".";
import Video, { ExternalVideoBlock } from "./components/Video";
import Code from "./components/Code";

const log = debug("notion-cms:react");

export interface Props {
  block: BlockType;
}

const Block: React.FC<Props> = ({ block }) => {
  switch (block.type) {
    case "heading_1":
      return (
        <h1 key={block.id}>
          <RTO objects={block.heading_1.rich_text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2 key={block.id}>
          <RTO objects={block.heading_2.rich_text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 key={block.id}>
          <RTO objects={block.heading_3.rich_text} />
        </h3>
      );
    case "paragraph":
      return (
        <p key={block.id}>
          <RTO objects={block.paragraph.rich_text} />
        </p>
      );
    case "image":
      return (
        <figure key={block.id}>
          <img
            src={
              block.image.type == "file"
                ? block.image.file.url
                : block.image.external.url
            }
            alt={block.image.caption.map((s) => s.plain_text).join(" ")}
            width="100%"
          />
          <figcaption>
            <RTO objects={block.image.caption} />
          </figcaption>
        </figure>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li key={block.id}>
          <RTO
            objects={
              block.type == "bulleted_list_item"
                ? block.bulleted_list_item?.rich_text
                : block.numbered_list_item?.rich_text
            }
          />
          {block.has_children &&
            React.createElement(
              block.children[0].type === "bulleted_list_item" ? "ul" : "ol",
              {
                children: block.children.map((block) => (
                  <Block block={block} key={block.id} />
                )),
              }
            )}
        </li>
      );
    case "divider":
      return <hr key={block.id} />;
    case "callout":
      return (
        <Callout key={block.id} icon={block.callout.icon}>
          <RTO objects={block.callout.rich_text} />
        </Callout>
      );
    case "bookmark":
      return <Bookmark key={block.id} block={block} />;
    case "toggle":
      return <Toggle title={block.toggle.rich_text} content={block.children} />;
    case "column_list":
      return (
        <Column.List>
          {block.children.map((col) => (
            <Column key={col.id}>
              <Blocks blocks={col.children} />
            </Column>
          ))}
        </Column.List>
      );
    case "video":
      switch (block.video.type) {
        case "external":
          return <Video block={block as ExternalVideoBlock} />;
        default:
          log('Ignoring unknown video type "%s": %O', block.video.type, block);
          return null;
      }
    case "code":
      return <Code block={block} />;
    case "table":
      return (
        <table>
          {(
            block.children.filter(
              (b) => b.type === "table_row"
            ) as TableRowBlock[]
          ).map((row, rowIndex) => (
            <tr key={row.id}>
              {row.table_row.cells.map((cell, colIndex) => {
                const header =
                  (block.table.has_column_header && rowIndex == 0) ||
                  (block.table.has_row_header && colIndex == 0);
                const Cell = header ? "th" : "td";
                return (
                  <Cell key={colIndex}>
                    <RTO objects={cell} />
                  </Cell>
                );
              })}
            </tr>
          ))}
        </table>
      );

    // We're not rendering those block types;
    case "unsupported":
    case "template":
      return null;
    default:
      log('Ignoring unknown block type "%s": %O', (block as any).type, block);
      return null;
  }
};

export default Block;
