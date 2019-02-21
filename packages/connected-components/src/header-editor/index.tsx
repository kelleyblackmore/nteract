/**
 * https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67
 */

// Vendor imports
import {
  Button,
  EditableText,
  H1,
  ITagProps,
  Position,
  Tag,
  Tooltip
} from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

// Styled Components
const tagStyle: object = {
  background: "#f1f8ff",
  color: "#0366d6",
  marginRight: "5px"
};

const authorStyle: object = {
  background: "#E5E5E5",
  fontStyle: "italic",
  marginRight: "5px"
};

const authorStyleBlack: object = { ...authorStyle, color: "black" };

export interface AuthorObject {
  name: string;
}

export interface HeaderDataProps {
  authors: AuthorObject[];
  description: string;
  tags: string[];
  title: string;
}

export interface HeaderEditorProps {
  /**
   * Whether or not the fields of the header can be edited.
   */
  editable: boolean;
  /**
   * Whether publishing to `Bookstore` is enabled.
   */
  publishingEnabled?: boolean;
  /**
   * The data that the header should be populated with.
   */
  headerData: HeaderDataProps;
  /**
   * An event handler to run whenever header fields are modified.
   */
  onChange: (props?: HeaderDataProps) => void;
  /**
   *
   */
  onRemove: (e: React.MouseEvent<HTMLButtonElement>, props: ITagProps) => void;
  /**
   * The theme of the header.
   */
  theme: "light" | "dark";
}

export interface HeaderEditorState {
  editMode: "none" | "author" | "tag";
}

const addTagMessage: JSX.Element = <span>Add a tag</span>;
const addAuthorMessage: JSX.Element = <span>Add an author</span>;

class HeaderEditor extends React.PureComponent<
  HeaderEditorProps,
  HeaderEditorState
> {
  static defaultProps: Partial<HeaderEditorProps> = {
    editable: true,
    publishingEnabled: false,
    headerData: {
      authors: [],
      description: "",
      tags: [],
      title: ""
    },
    // tslint:disable no-empty
    onChange: () => {},
    onRemove: (e: React.MouseEvent<HTMLButtonElement>, props: ITagProps) => {},
    theme: "light"
  };

  constructor(props: HeaderEditorProps) {
    super(props);

    this.state = {
      editMode: "none"
    };
  }


  onTextChange = (newText: string): void => {
    this.props.onChange({
      ...this.props.headerData,
      title: newText
    });
  };

  onEditorChange = (newText: string) => {
    this.props.onChange({
      ...this.props.headerData,
      description: newText
    });
  };

  onAuthorsRemove = (t: any) => (
    evt: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ) => {
    if (this.props.editable === true) {
      this.props.onChange({
        ...this.props.headerData,
        authors: this.props.headerData.authors.filter(p => p.name !== t.name)
      });
      return;
    }
    return;
  };

  onTagsRemove = (t: any) => (
    e: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ) => {
    if (this.props.editable) {
      this.props.onChange({
        ...this.props.headerData,
        tags: this.props.headerData.tags.filter(p => p !== t)
      });
      return;
    }
    return;
  };

  onTagsConfirm = (e: any) => {
    this.props.onChange({
      ...this.props.headerData,
      tags: [...this.props.headerData.tags, e]
    });
    this.setState({ editMode: "none" });
  };

  onAuthorsConfirm = (e: any) => {
    this.props.onChange({
      ...this.props.headerData,
      authors: [...this.props.headerData.authors, { name: e }]
    });
    this.setState({ editMode: "none" });
  };

  onCancel = () => this.setState({ editMode: "none" });

  onClick = () => this.setState({ editMode: "author" });

  onAdd = () => this.setState({ editMode: "tag" });

  render(): JSX.Element {
    // Otherwise assume they have their own editor component
    const { editable, publishingEnabled, headerData, onChange } = this.props;
    const marginStyles: object = { marginTop: "10px" };
    const styles: object = { background: "#EEE", padding: "10px" };

    return (
      <header>
        <div style={styles}>
          <H1>
            <EditableText
              value={headerData.title}
              placeholder="Edit title..."
              disabled={!editable}
              onChange={this.onTextChange}
            />
          </H1>
          <div style={marginStyles}>
            <EditableText
              maxLength={280}
              maxLines={12}
              minLines={3}
              multiline
              placeholder="Edit description..."
              selectAllOnFocus={false}
              value={headerData.description}
              disabled={!editable}
              onChange={this.onEditorChange}
            />
          </div>
          <div>
            {headerData.authors.length <= 0 ? null : "By "}
            {headerData.authors.map(t => (
              <Tag
                key={t.name}
                large
                minimal
                style={authorStyle}
                onRemove={this.onAuthorsRemove(t)}
              >
                {t.name}
              </Tag>
            ))}
            {(this.state.editMode === "author" && (
              <Tag style={authorStyleBlack}>
                <EditableText
                  maxLength={40}
                  className="author-entry"
                  placeholder="Enter Author Name..."
                  selectAllOnFocus
                  onConfirm={this.onAuthorsConfirm}
                  onCancel={this.onCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addAuthorMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                <Button
                  icon="add"
                  className="author-button"
                  onClick={this.onPublish}
                  minimal
                  disabled={!editable}
                />
              </Tooltip>
            )}
          </div>

          <div>
            {headerData.tags.map(t => (
              <Tag key={t} style={tagStyle} onRemove={this.onTagsRemove}>
                {t}
              </Tag>
            ))}
            {(this.state.editMode === "tag" && (
              <Tag style={tagStyle}>
                <EditableText
                  maxLength={20}
                  placeholder="Enter Tag Name..."
                  selectAllOnFocus
                  onConfirm={this.onTagsConfirm}
                  onCancel={this.onCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addTagMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                {
                  <Button
                    icon="add"
                    minimal
                    onClick={this.onAdd}
                    disabled={!editable}
                  />
                }
              </Tooltip>
            )}
          </div>
          {publishingEnabled ? (
            <Button type={"button"} text={"Publish"} onClick={this.onPublish} />
          ) : null}
        </div>
      </header>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onPublish: dispatch(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    /**
     * Publish to S3 bucket
     * 1. Write an action for publishing to Bookstore
     * 2. Write an epic that takes a notebook
     *    and publishes it to an Bookstore
     * 3. Write a reducer for publishing to Bookstore
     * 4. Create a confirmation for success or error handling for failure
     *
     * In this function, kick off the action that publishes to Bookstore
     * and follows the process above.
     *
     * 1. In order to do this we'll need to mapStateToProps and
     *    mapDispatchToProps. In mapStateToProps, we probably want to map the
     *    enablePublishing prop.
     * 2. In the epic, I need to get the current notebook from state and save
     *    that to Bookstore.
     * 3. The reducer is most likely a fall through since there really isn't
     *    much to update.
     * 4. To create a success or failure confirmation, I'll need to create
     *    a snackbar that accepts messages and appears when the message cue
     *    recieves a new message. Most likely this is another action created
     *    from the epic that leads to a reducer that populates the state
     *    with a message to the messages cue.
     *
     * To complete this functionality, I'll need to change the CSS and layout of
     * the header editor. I'll need to create an action and its payload type.
     * I'll need to get the information for hooking this up to bookstore.
     * Finally, I'll need to create a SnackBar component. Add messaging
     * cues to the `AppState` and add logic somewhere regarding how, when, and
     * where these messages are shown.
     */
  });

  };
};

// We export this for testing purposes.
// export { HeaderEditor };

export default HeaderEditor;
