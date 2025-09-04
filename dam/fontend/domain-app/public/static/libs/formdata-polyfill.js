/* Blob.js
 * A Blob implementation.
 * 2018-01-12
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

(function (view) {
	"use strict";

	view.URL = view.URL || view.webkitURL;

	if (view.Blob && view.URL) {
		try {
			new Blob;
			return;
		} catch (e) {}
	}

	// Internally we use a BlobBuilder implementation to base Blob off of
	// in order to support older browsers that only have BlobBuilder
	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob

			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array

			, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		// Polyfill URL
		if (!real_URL.createObjectURL) {
			URL = view.URL = function(uri) {
				var
					  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
					, uri_origin
				;
				uri_info.href = uri;
				if (!("origin" in uri_info)) {
					if (uri_info.protocol.toLowerCase() === "data:") {
						uri_info.origin = null;
					} else {
						uri_origin = uri.match(origin);
						uri_info.origin = uri_origin && uri_origin[1];
					}
				}
				return uri_info;
			};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		FB_proto.close = function() {
			this.size = 0;
			delete this.data;
		};
		return FakeBlobBuilder;
	}(view));

	view.Blob = function(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				if (Uint8Array && blobParts[i] instanceof Uint8Array) {
					builder.append(blobParts[i].buffer);
				}
				else {
					builder.append(blobParts[i]);
				}
			}
		}
		var blob = builder.getBlob(type);
		if (!blob.slice && blob.webkitSlice) {
			blob.slice = blob.webkitSlice;
		}
		return blob;
	};

	var getPrototypeOf = Object.getPrototypeOf || function(object) {
		return object.__proto__;
	};
	view.Blob.prototype = getPrototypeOf(new view.Blob());
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this
));



// Generated by CoffeeScript 1.7.1
(function(self) {
  var BOUNDARY, BlobPart, CRLF, FormData, StringPart, support;
  if (self.FormData) {
    return;
  }
  support = {
    arrayBuffer: !!self.ArrayBuffer,
    blob: !!self.FileReader && !!self.Blob && (function() {
      try {
        new Blob();
        return true;
      } catch (_error) {
        return false;
      }
    })()
  };
  CRLF = "\r\n";
  BOUNDARY = "--------FormData" + Math.random();
  StringPart = (function() {
    function StringPart(name, value) {
      this.name = name;
      this.value = value;
    }

    StringPart.prototype.convertToString = function() {
      var lines;
      lines = [];
      return new Promise((function(_this) {
        return function(resolve) {
          lines.push("--" + BOUNDARY + CRLF);
          lines.push("Content-Disposition: form-data; name=\"" + _this.name + "\";" + CRLF + CRLF);
          lines.push("" + _this.value + CRLF);
          return resolve(lines.join(''));
        };
      })(this));
    };

    return StringPart;

  })();
  BlobPart = (function() {
    function BlobPart(name, filename, souce) {
      this.name = name;
      this.filename = filename;
      this.souce = souce;
    }

    BlobPart.prototype._readArrayBufferAsString = function(buff) {
      var view;
      view = new Uint8Array(buff);
      return view.reduce(function(acc, b) {
        acc.push(String.fromCharCode(b));
        return acc;
      }, new Array(view.length)).join('');
    };

    BlobPart.prototype._readBlobAsArrayBuffer = function() {
      return new Promise((function(_this) {
        return function(resolve) {
          var reader;
          reader = new FileReader();
          reader.readAsArrayBuffer(_this.souce);
          return reader.onload = function() {
            return resolve(_this._readArrayBufferAsString(reader.result));
          };
        };
      })(this));
    };

    BlobPart.prototype._readBlobAsBinary = function() {
      return new Promise((function(_this) {
        return function(resolve) {
          return resolve(_this.souce.getAsBinary());
        };
      })(this));
    };

    BlobPart.prototype.convertToString = function() {
      var lines;
      lines = [];
      lines.push("--" + BOUNDARY + CRLF);
      lines.push("Content-Disposition: form-data; name=\"" + this.name + "\"; filename=\"" + this.filename + "\"" + CRLF);
      lines.push("Content-Type: " + this.souce.type + CRLF + CRLF);
      if (support.blob && support.arrayBuffer) {
        return this._readBlobAsArrayBuffer().then(function(strings) {
          lines.push(strings + CRLF);
          return lines.join('');
        });
      } else {
        return this._readBlobAsBinary().then(function(strings) {
          lines.push(strings + CRLF);
          return lines.join('');
        });
      }
    };

    return BlobPart;

  })();
  FormData = (function() {
    function FormData() {
      this.polyfill = true;
      this._parts = [];
      this.boundary = BOUNDARY;
    }

    FormData.prototype._stringToTypedArray = function(string) {
      var bytes;
      bytes = Array.prototype.map.call(string, function(s) {
        return s.charCodeAt(0);
      });
      return new Uint8Array(bytes);
    };

    FormData.prototype.append = function(key, value) {
      var part;
      part = null;
      if (typeof value === "string") {
        part = new StringPart(key, value);
      } else if (value instanceof Blob) {
        part = new BlobPart(key, value.name || "blob", value);
      } else {
        part = new StringPart(key, value);
      }
      if (part) {
        this._parts.push(part);
      }
      return this;
    };

    FormData.prototype.toString = function() {
      var parts;
      parts = this._parts;
      return Promise.all(this._parts.map(function(part) {
        return part.convertToString();
      })).then(function(lines) {
        lines.push("--" + BOUNDARY + "--");
        return lines.join('');
      }).then(this._stringToTypedArray);
    };

    return FormData;

  })();
  return self.FormData = FormData;
})(typeof self !== 'undefined' ? self : this);