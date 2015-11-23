/* ************************************************************************

   QR Code Generator Library

   Copyright:
     2015 Andriy Syrovenko

   This project is dual-licensed under the terms of either:

     * GNU Lesser General Public License (LGPL) version 2.1

     * Eclipse Public License (EPL)

     See the license.txt file in the project's top-level directory for details.

   Authors:
     Andriy Syrovenko

************************************************************************ */

/**
 * This class represents a QR Code Segment, i.e. a sequence of input data
 * encoded according to the rules of one encoding mode. Only Numeric,
 * Alphanumeric and Byte encoding modes are currently supported. Data in
 * byte mode is encoded in either ISO-8859-1 or UTF-8.
 *
 * @internal
 */
qx.Bootstrap.define("qrcode.Segment",
{
  extend : Object,


  statics :
  {
    __alphaNumSet : null,
    __charCountBitsMap : [
      [10, 9, 8, 8],
      [12, 11, 16, 10],
      [14, 13, 16, 12]
    ]
  },


  /**
   * Creates a new instance of <code>Segment</code>
   *
   * @param str {String} A data to be encoded
   */
  construct : function(str)
  {
    // TODO: Add ability to force Unicode somehow
    //       If one segment is in Unicode, the rest should be Unicode too

    var clazz = qrcode.Segment;
    var c, c1, i, unicode;

    this.base(arguments);

    if(!clazz.__alphaNumSet) {
      clazz.__alphaNumSet = {};
      for(i = 0; i < 10; i++) {
        clazz.__alphaNumSet[0x30 + i] = i;
      }
      for(i = 10; i < 36; i++) {
        clazz.__alphaNumSet[0x41 - 10 + i] = i;
      }
      clazz.__alphaNumSet[0x20] = 36;
      clazz.__alphaNumSet[0x24] = 37;
      clazz.__alphaNumSet[0x25] = 38;
      clazz.__alphaNumSet[0x2A] = 39;
      clazz.__alphaNumSet[0x2B] = 40;
      clazz.__alphaNumSet[0x2D] = 41;
      clazz.__alphaNumSet[0x2E] = 42;
      clazz.__alphaNumSet[0x2F] = 43;
      clazz.__alphaNumSet[0x3A] = 44;
    }

    this.__mode = 0;
    unicode = false;

    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if(0xff < c) {
        this.__mode = 2;
        unicode = true;
        break;
      }

      if(this.__mode == 2) {
        continue;
      }

      if(this.__mode == 0 && (0x30 <= c && c <= 0x39)) { // '0..9'
        continue;
      }

      this.__mode = (c in clazz.__alphaNumSet) ? 1 : 2;
    }

    if(!unicode) {
      this.__data = Array(str.length);
      for(i = 0; i < str.length; i++) {
        this.__data[i] = str.charCodeAt(i);
      }
    }
    else {
      this.__data = [];

      c1 = null;
      for(i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);

        if(c1 != null) {
          if (0xDC00 <= c && c < 0xE000) {
            // surrogate pair
            c = (((c1 & 0x3FF) << 10) | (c & 0x3FF)) + 0x10000;
            this.__data.push(
              0xF0 | (c >> 18),
              0x80 | ((c >> 12) & 0x3F),
              0x80 | ((c >> 6) & 0x3F),
              0x80 | (c & 0x3F));
          }
          else {
            // Invalid caharacter
            this.__data.push(0xEF, 0xBF, 0xBD);
          }
          c1 = null;
        }
        else if (c < 0x80) {
          this.__data.push(c);
        }
        else if (c < 0x800) {
          this.__data.push(
            0xC0 | (c >> 6),
            0x80 | (c & 0x3F));
        }
        else if (c < 0xD800 || c >= 0xE000) {
          this.__data.push(
            0xe0 | (c >> 12),
            0x80 | ((c >> 6) & 0x3f),
            0x80 | (c & 0x3f));
        }
        else if (c < 0xDC00) {
          c1 = c;
        }
        else {
          // Invalid caharacter
          this.__data.push(0xEF, 0xBF, 0xBD);
        }
      }
    }

    this.setVersion(1);
  },


  members :
  {
    __data : null,
    __charCountBits : null,
    __mode : null,


    /**
     * Sets the target QR Symbol version
     *
     * @param version {Integer?} QR Symbol version.
     */
    setVersion : function(version) {
      var clazz = qrcode.Segment;
      if(version <= 9) {
        this.__charCountBits = clazz.__charCountBitsMap[0][this.__mode];
      }
      else if(version <= 26) {
        this.__charCountBits = clazz.__charCountBitsMap[1][this.__mode];
      }
      else {
        this.__charCountBits = clazz.__charCountBitsMap[2][this.__mode];
      }
    },


    /**
     * Calculates the length in bits of the segment data encoded according
     * to the selected encoding mode and QR Symbol version.
     *
     * @return {Integer} Data length in bits
     */
    getBitStreamLength : function() {
      var len;

      if(this.__mode == 0) {
        len = 10 * Math.floor(this.__data.length / 3);
        switch(this.__data.length % 3) {
          case 1: len += 4; break;
          case 2: len += 7; break;
        }
      }
      else if(this.__mode == 1) {
        len = 11 * (this.__data.length >> 1);
        len += 6 * (this.__data.length & 1);
      }
      else {
        len = 8 * this.__data.length;
      }

      return len + this.__charCountBits + 4;
    },


    /**
     * Encodes segment data into a stream of bits in accordnace with the rules
     * of the selected encoding mode and QR Symbol version.
     *
     * @param buffer {qrcode.BitBuffer} A buffer the resulting bit stream
     *   should be written to
     */
    encode : function(buffer) {
      var clazz = qrcode.Segment;
      var i, sym;

      switch(this.__mode) {
        case 0:
          buffer.append(0x1, 4);
          buffer.append(this.__data.length, this.__charCountBits);

          sym = 0;
          for(i = 0; i < this.__data.length; i++) {
            sym = sym * 10 + this.__data[i] - 0x30;
            if((i % 3) == 2) {
              buffer.append(sym, 10);
              sym = 0;
            }
          }

          i = i % 3;
          if(i != 0) {
            buffer.append(sym, (i == 1) ? 4 : 7);
          }

          break;

        case 1:
          buffer.append(0x2, 4);
          buffer.append(this.__data.length, this.__charCountBits);

          sym = 0;
          for(i = 0; i < this.__data.length; i++) {
            sym = sym * 45 + clazz.__alphaNumSet[this.__data[i]];
            if(i & 0x1) {
              buffer.append(sym, 11);
              sym = 0;
            }
          }

          if(i & 0x1) {
            buffer.append(sym, 6);
          }

          break;

        case 2:
          buffer.append(0x4, 4);
          buffer.append(this.__data.length, this.__charCountBits);
          for(i = 0; i < this.__data.length; i++) {
            buffer.append(this.__data[i], 8);
          }
          break;
      }
    }
  }
});
