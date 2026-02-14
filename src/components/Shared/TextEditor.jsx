import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";

const TextEditor = ({ value = "", onChange, placeholder = "Type here..." }) => {
  const editor = useRef(null);
  const [content, setContent] = useState(value || "");

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleEditorChange = (newContent) => {
    if (newContent !== value) {
      onChange(newContent);
    }
  };

  const config = {
    placeholder: placeholder,
    readonly: false,
    toolbarSticky: false,
    height: 300,
    toolbarAdaptive: false,
    toolbar: true,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "font",
      "fontsize",
      "|",
      "align",
      "|",
      "ul",
      "ol",
      "|",
      "image",
      "link",
      "hr",
      "|",
      "undo",
      "redo",
      "|",
      "fullsize",
    ],
    uploader: {
      insertImageAsBase64URI: false,
      imagesExtensions: ["jpg", "png", "jpeg", "gif"],
      withCredentials: false,
      format: "json",
      method: "POST",
      url: `${process.env.REACT_APP_BASE_URL}/api/products/upload`,
      prepareData: function (data) {
        if (this.files && this.files.length) {
          data.append("images", this.files[0]);
        } else {
          data.append("images", this.file);
        }
        return data;
      },
      isSuccess: function (resp) {
        return Array.isArray(resp) || (resp && !resp.error);
      },
      getMsg: function (resp) {
        if (Array.isArray(resp)) {
          return "Upload successful";
        }
        return resp.msg
          ? resp.msg.join !== undefined
            ? resp.msg.join(" ")
            : resp.msg
          : "Upload failed";
      },
      process: function (resp) {
        // Handle array response from backend
        if (Array.isArray(resp)) {
          return {
            files: resp,
            path: "",
            baseurl: "",
            error: 0,
            msg: "Upload successful",
          };
        }

        // Handle object response
        return {
          files: resp.files || [],
          path: resp.path || "",
          baseurl: resp.baseurl || "",
          error: resp.error ? 1 : 0,
          msg: resp.msg || "Upload complete",
        };
      },
      defaultHandlerSuccess: function (data, resp) {
        const files = data.files || [];
        if (files.length) {
          this.selection.insertImage(files[0], null, 250);
        }
      },
      defaultHandlerError: function (resp) {
        this.events.fire("errorPopap", this.i18n(resp.msg || "Upload error"));
      },
    },
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    addNewLineDeltaShow: 0,
    style: {
      backgroundColor: "#FFFEFC",
    },
    events: {
      afterInit: function (jodit) {
        if (jodit.toolbar) {
          jodit.toolbar.container.style.backgroundColor = "#F8F1F5";
        }
      },
    },
  };

  return (
    <div style={{ width: "100%", minHeight: "350px" }}>
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={handleEditorChange}
      />
    </div>
  );
};

export default TextEditor;
