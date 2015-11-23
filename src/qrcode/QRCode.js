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
 * A QR Code generator class.
 *
 * Provides a way to encode a QR symbol and draw it on an HTML5 canvas.
 * Supports adding several data segments to a single QR symbol. When adding a
 * new segment it is automatically analyzed and the most space-efficient encoding
 * mode is chosen. Currently only Numeric, Alphanumeric and Byte encoding modes
 * are supported.
 */
qx.Bootstrap.define("qrcode.QRCode",
{
  extend : Object,


  /**
   * Creates a new instance of <code>QRCode</code>.
   *
   * @param str {String?} Data to be encoded in the QR symbol. If present, one
   *   segment is automatically added to the newly created <code>QRCode</code> instance.
   *   See {@link #addSegment}.
   * @param ecLevel {String?"M"} Error correction level. See {@link #setECLevel}.
   *
   */
  construct : function(str, ecLevel)
  {
    var clazz = qrcode.QRCode;
      var x, i;

    this.base(arguments);

    this.__segments = new Array();
    if(str) {
      this.addSegment(str);
    }
    if(ecLevel) {
      this.setECLevel(ecLevel);
    }

    if(!clazz.__rs_exp_tbl) {
      /*
       * Calculating Galois field GF(2^8) logarithm and anti-log tables.
       * See: https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders
       */
      clazz.__rs_exp_tbl = new Array(512);
      clazz.__rs_log_tbl = new Array(256);

      clazz.__rs_exp_tbl[0] = 1;
      clazz.__rs_log_tbl[1] = 0;

      x = 1;
      for(i = 1; i < 255; i++) {
        x <<= 1;
        if (x & 0x100) {
          x ^= 0x11d;
        }
        clazz.__rs_exp_tbl[i] = x;
        clazz.__rs_log_tbl[x] = i;
      }

      for(i = 255; i < 512; i++) {
        clazz.__rs_exp_tbl[i] = clazz.__rs_exp_tbl[i - 255];
      }
    }
  },


  statics :
  {
    __rs_exp_tbl : null,
    __rs_log_tbl : null,

    __codeProps : [
      [ // Error correction level 'M', version 1 - 40
        // [ Total data codewords, EC codewords per block, Block count ]
        [ 16, 10, 1 ],
        [ 28, 16, 1 ],
        [ 44, 26, 1 ],
        [ 64, 18, 2 ],
        [ 86, 24, 2 ],
        [ 108, 16, 4 ],
        [ 124, 18, 4 ],
        [ 154, 22, 4 ],
        [ 182, 22, 5 ],
        [ 216, 26, 5 ],
        [ 254, 30, 5 ],
        [ 290, 22, 8 ],
        [ 334, 22, 9 ],
        [ 365, 24, 9 ],
        [ 415, 24, 10 ],
        [ 453, 28, 10 ],
        [ 507, 28, 11 ],
        [ 563, 26, 13 ],
        [ 627, 26, 14 ],
        [ 669, 26, 16 ],
        [ 714, 26, 17 ],
        [ 782, 28, 17 ],
        [ 860, 28, 18 ],
        [ 914, 28, 20 ],
        [ 1000, 28, 21 ],
        [ 1062, 28, 23 ],
        [ 1128, 28, 25 ],
        [ 1193, 28, 26 ],
        [ 1267, 28, 28 ],
        [ 1373, 28, 29 ],
        [ 1455, 28, 31 ],
        [ 1541, 28, 33 ],
        [ 1631, 28, 35 ],
        [ 1725, 28, 37 ],
        [ 1812, 28, 38 ],
        [ 1914, 28, 40 ],
        [ 1992, 28, 43 ],
        [ 2102, 28, 45 ],
        [ 2216, 28, 47 ],
        [ 2334, 28, 49 ]
      ],
      [ // Error correction level 'L', version 1 - 40
        // [ Total data codewords, EC codewords per block, Block count ]
        [ 19, 7, 1 ],
        [ 34, 10, 1 ],
        [ 55, 15, 1 ],
        [ 80, 20, 1 ],
        [ 108, 26, 1 ],
        [ 136, 18, 2 ],
        [ 156, 20, 2 ],
        [ 194, 24, 2 ],
        [ 232, 30, 2 ],
        [ 274, 18, 4 ],
        [ 324, 20, 4 ],
        [ 370, 24, 4 ],
        [ 428, 26, 4 ],
        [ 461, 30, 4 ],
        [ 523, 22, 6 ],
        [ 589, 24, 6 ],
        [ 647, 28, 6 ],
        [ 721, 30, 6 ],
        [ 795, 28, 7 ],
        [ 861, 28, 8 ],
        [ 932, 28, 8 ],
        [ 1006, 28, 9 ],
        [ 1094, 30, 9 ],
        [ 1174, 30, 10 ],
        [ 1276, 26, 12 ],
        [ 1370, 28, 12 ],
        [ 1468, 30, 12 ],
        [ 1531, 30, 13 ],
        [ 1631, 30, 14 ],
        [ 1735, 30, 15 ],
        [ 1843, 30, 16 ],
        [ 1955, 30, 17 ],
        [ 2071, 30, 18 ],
        [ 2191, 30, 19 ],
        [ 2306, 30, 19 ],
        [ 2434, 30, 20 ],
        [ 2566, 30, 21 ],
        [ 2702, 30, 22 ],
        [ 2812, 30, 24 ],
        [ 2956, 30, 25 ]
      ],
      [ // Error correction level 'H', version 1 - 40
        // [ Total data codewords, EC codewords per block, Block count ]
        [ 9, 17, 1 ],
        [ 16, 28, 1 ],
        [ 26, 22, 2 ],
        [ 36, 16, 4 ],
        [ 46, 22, 4 ],
        [ 60, 28, 4 ],
        [ 66, 26, 5 ],
        [ 86, 26, 6 ],
        [ 100, 24, 8 ],
        [ 122, 28, 8 ],
        [ 140, 24, 11 ],
        [ 158, 28, 11 ],
        [ 180, 22, 16 ],
        [ 197, 24, 16 ],
        [ 223, 24, 18 ],
        [ 253, 30, 16 ],
        [ 283, 28, 19 ],
        [ 313, 28, 21 ],
        [ 341, 26, 25 ],
        [ 385, 28, 25 ],
        [ 406, 30, 25 ],
        [ 442, 24, 34 ],
        [ 464, 30, 30 ],
        [ 514, 30, 32 ],
        [ 538, 30, 35 ],
        [ 596, 30, 37 ],
        [ 628, 30, 40 ],
        [ 661, 30, 42 ],
        [ 701, 30, 45 ],
        [ 745, 30, 48 ],
        [ 793, 30, 51 ],
        [ 845, 30, 54 ],
        [ 901, 30, 57 ],
        [ 961, 30, 60 ],
        [ 986, 30, 63 ],
        [ 1054, 30, 66 ],
        [ 1096, 30, 70 ],
        [ 1142, 30, 74 ],
        [ 1222, 30, 77 ],
        [ 1276, 30, 81 ]
      ],
      [ // Error correction level 'Q', version 1 - 40
        // [ Total data codewords, EC codewords per block, Block count ]
        [ 13, 13, 1 ],
        [ 22, 22, 1 ],
        [ 34, 18, 2 ],
        [ 48, 26, 2 ],
        [ 62, 18, 4 ],
        [ 76, 24, 4 ],
        [ 88, 18, 6 ],
        [ 110, 22, 6 ],
        [ 132, 20, 8 ],
        [ 154, 24, 8 ],
        [ 180, 28, 8 ],
        [ 206, 26, 10 ],
        [ 244, 24, 12 ],
        [ 261, 20, 16 ],
        [ 295, 30, 12 ],
        [ 325, 24, 17 ],
        [ 367, 28, 16 ],
        [ 397, 28, 18 ],
        [ 445, 26, 21 ],
        [ 485, 30, 20 ],
        [ 512, 28, 23 ],
        [ 568, 30, 23 ],
        [ 614, 30, 25 ],
        [ 664, 30, 27 ],
        [ 718, 30, 29 ],
        [ 754, 28, 34 ],
        [ 808, 30, 34 ],
        [ 871, 30, 35 ],
        [ 911, 30, 38 ],
        [ 985, 30, 40 ],
        [ 1033, 30, 43 ],
        [ 1115, 30, 45 ],
        [ 1171, 30, 48 ],
        [ 1231, 30, 51 ],
        [ 1286, 30, 53 ],
        [ 1354, 30, 56 ],
        [ 1426, 30, 59 ],
        [ 1502, 30, 62 ],
        [ 1582, 30, 65 ],
        [ 1666, 30, 68 ]
      ]
    ],

     __alignPatternPositions : [
      [ 6, 18 ],
      [ 6, 22 ],
      [ 6, 26 ],
      [ 6, 30 ],
      [ 6, 34 ],
      [ 6, 22, 38 ],
      [ 6, 24, 42 ],
      [ 6, 26, 46 ],
      [ 6, 28, 50 ],
      [ 6, 30, 54 ],
      [ 6, 32, 58 ],
      [ 6, 34, 62 ],
      [ 6, 26, 46, 66 ],
      [ 6, 26, 48, 70 ],
      [ 6, 26, 50, 74 ],
      [ 6, 30, 54, 78 ],
      [ 6, 30, 56, 82 ],
      [ 6, 30, 58, 86 ],
      [ 6, 34, 62, 90 ],
      [ 6, 28, 50, 72, 94 ],
      [ 6, 26, 50, 74, 98 ],
      [ 6, 30, 54, 78, 102 ],
      [ 6, 28, 54, 80, 106 ],
      [ 6, 32, 58, 84, 110 ],
      [ 6, 30, 58, 86, 114 ],
      [ 6, 34, 62, 90, 118 ],
      [ 6, 26, 50, 74, 98, 122 ],
      [ 6, 30, 54, 78, 102, 126 ],
      [ 6, 26, 52, 78, 104, 130 ],
      [ 6, 30, 56, 82, 108, 134 ],
      [ 6, 34, 60, 86, 112, 138 ],
      [ 6, 30, 58, 86, 114, 142 ],
      [ 6, 34, 62, 90, 118, 146 ],
      [ 6, 30, 54, 78, 102, 126, 150 ],
      [ 6, 24, 50, 76, 102, 128, 154 ],
      [ 6, 28, 54, 80, 106, 132, 158 ],
      [ 6, 32, 58, 84, 110, 136, 162 ],
      [ 6, 26, 54, 82, 110, 138, 166 ],
      [ 6, 30, 58, 86, 114, 142, 170 ]
    ],

    __maskFunctions : [
      function(m, x, y) { return ((x+y) % 2) ? m : !m; },
      function(m, x, y) { return (y % 2) ? m : !m; },
      function(m, x, y) { return (x % 3) ? m : !m; },
      function(m, x, y) { return ((x+y) % 3) ? m : !m; },
      function(m, x, y) { return ((Math.floor(y/2) + Math.floor(x/3)) % 2) ? m : !m; },
      function(m, x, y) { return ((x*y) % 2 + (x*y) % 3) ? m : !m; },
      function(m, x, y) { return (((x*y) % 2 + (x*y) % 3) % 2) ? m : !m; },
      function(m, x, y) { return (((x+y) % 2 + (x*y) % 3) % 2) ? m : !m; }
    ],

    __penaltySequence : [ 1, 0, 1, 1, 1, 0, 1 ]
  },


  members :
  {
    __segments : null,
    __ecLevel : 0,
    __symbol : null,
    __symbolVersion : null,
    __symbolSize : null,


    /**
     * Adds new segment (a sequence of input data). The most space-efficient
     * encoding mode is automatically selected for each segment. Currently
     * only Numeric, Alphanumeric and Byte encoding modes are supported. The
     * data in Byte encoding mode is encoded using ISO-8859-1 character
     * encoding if possible, and using UTF-8 character encoding otherwise.
     *
     * @param str {String} Data to be encoded.
     */
    addSegment : function(str) {
      this.__segments.push(new qrcode.Segment(str));
      this.__symbol = null;
    },


    /**
     * Clears QR symbol, i.e. removes all previously added segments.
     */
    clear : function() {
      this.__segments = new Array();
      this.__symbol = null;
    },


    /**
     * Sets error correction level.
     *
     * Valid error correction levels are:
     *
     * <ul>
     *   <li>L - allows recovery of 7% of symbol codewords</li>
     *   <li>M - allows recovery of 15% of symbol codewords</li>
     *   <li>Q - allows recovery of 25% of symbol codewords</li>
     *   <li>H - allows recovery of 30% of symbol codewords</li>
     * </ul>
     *
     * @param value {String} Error correction level
     */
    setECLevel : function(value) {
      switch(value) {
        case 'L': this.__ecLevel = 1; break;
        case 'M': this.__ecLevel = 0; break;
        case 'Q': this.__ecLevel = 3; break;
        case 'H': this.__ecLevel = 2; break;
        default:
          throw new Error("Invalid error correction level value '" + value +"'. " +
            "Valid values are 'L', 'M', 'Q' and 'H'.");
      }

      this.__symbol = null;
    },


    /**
     * Returns QR symbol size in modules.
     *
     * @return {Integer} A number of modules in the grid along each side.
     */
    getSymbolSize : function() {
      if(!this.__symbol) {
        this.__encodeSymbol();
      }

      return this.__symbolSize;
    },


    /**
     * Returns QR symbol image size in pixels. Image size is calculated by
     * adding 2x4 margin modules to {@link #getSymbolSize symbol size} and then
     * multiplying the result by a scale factor.
     *
     * @param scale {Integer?2} Scale factor.
     *
     * @return {Integer} A size of each side of the image in pixels.
     */
    getImageSize : function(scale) {
      scale = scale || 2;
      return scale * (this.getSymbolSize() + 8); // + 2x margins
    },


    /**
     * Draws QR symbol image on the HTML5 canvas.
     *
     * The image size and appearance may be customized through the optional
     * <code>options</code> parameter. The following options are supported:
     *
     * <ul>
     *   <li><code>scale</code> - scale factor, i.e. a module size in pixels, the default is 2.</li>
     *   <li><code>left</code> - horizontal offset of the image, the default is 0.</li>
     *   <li><code>top</code> - vertical offset of the image. The default is 0.</li>
     *   <li><code>light</code> - color of the light modules, the default is <code>#FFF</code>.</li>
     *   <li><code>dark</code> - color of the dark modules, the default is <code>#000</code>.</li>
     * </ul>
     *
     * @param ctx {canvasrenderingcontext2d} A canvas 2D drawing context to draw
     *   the symbol on.
     * @param options {Map?} Drawing options.
     */
    draw : function(ctx, options) {
      var i, x, y, marginLeft, marginTop;

      if (options === undefined) {
        options = {};
      }

      options.scale = options.scale || 2;
      options.left = options.left || 0;
      options.top = options.top || 0;
      options.light = options.light || "#FFF";
      options.dark = options.dark || "#000";

      if(!this.__symbol) {
        this.__encodeSymbol();
      }

      x = this.getImageSize(options.scale);
      ctx.fillStyle = options.light;
      ctx.fillRect(options.left, options.top, x, x);
      ctx.fillStyle = options.dark;

      i = 0;
      marginLeft = options.left + 4 * options.scale;
      marginTop = options.top + 4 * options.scale;
      for (y = 0; y < this.__symbolSize; y++) {
        for (x = 0; x < this.__symbolSize; x++) {
          if(this.__symbol[i++]) {
            ctx.fillRect(
              marginLeft + x * options.scale, marginTop + y * options.scale,
              options.scale, options.scale);
          }
        }
      }
    },


    /**
     * Encodes segments data and creates QR symbol matrix
     */
    __encodeSymbol : function() {
      var i, j, m, ver, len, score, symbol, dataBits, dataBytes,
          blockDataBytes, blockECBytes, blockCnt, shortBlockCnt,
          bitBuffer, ecData, extraByte, finalMessage, dataOffset,
          rsGen;

      // Looking for the minimal QR Code version large enough to accomodate
      //   all segments
      for(ver = 1; ver <= 40; ver++) {
        len = 0;
        for(i = 0; i < this.__segments.length; i++) {
          this.__segments[i].setVersion(ver);
          len += this.__segments[i].getBitStreamLength();
        }
        dataBits = 8 * qrcode.QRCode.__codeProps[this.__ecLevel][ver-1][0];
        if(len <= dataBits) {
          dataBytes = qrcode.QRCode.__codeProps[this.__ecLevel][ver-1][0];
          blockECBytes = qrcode.QRCode.__codeProps[this.__ecLevel][ver-1][1];
          blockCnt = qrcode.QRCode.__codeProps[this.__ecLevel][ver-1][2];
          break;
        }
      }

      if(ver > 40) {
        throw new Error("The input data is too long to fit a single QR code symbol");
      }

      this.__symbolVersion = ver;
      this.__symbolSize = 17 + 4 * ver;

      // Converting segments' data into a bit stream
      bitBuffer = new qrcode.BitBuffer(dataBits);
      for(i = 0; i < this.__segments.length; i++) {
        this.__segments[i].encode(bitBuffer);
      }
      if(bitBuffer.getLength() + 4 <= dataBits) {
        // Adding terminator sequence
        bitBuffer.append(0, 4);
      }
      if(bitBuffer.getLength() & 0x0f) {
        // Zero-padping to a byte boundary
        bitBuffer.append(0, 8 - (bitBuffer.getLength() & 0x0f));
      }
      for(i = dataBits - bitBuffer.getLength(); i > 0; i -= 16) {
        // Padding to the full QR symbol length
        bitBuffer.append(0xEC11, Math.min(i, 16), 16);
      }

      finalMessage = Array(dataBytes + blockECBytes * blockCnt);

      blockDataBytes = Math.floor(dataBytes / blockCnt);
      shortBlockCnt = blockCnt - (dataBytes % blockCnt);

      // Splitting data into the given number of error-correction blocks and
      //   filling each block with symbol data and error-correction codes
      rsGen = this.__rsCalculateGenerator(blockECBytes);
      dataOffset = 0;
      for(i = 0; i < blockCnt; i++) {
        extraByte = (i < shortBlockCnt) ? 0 : 1;

        ecData = this.__rsPolyMod(
          bitBuffer.getDataArray().slice(dataOffset, dataOffset + blockDataBytes + extraByte).concat(Array(blockECBytes)),
          rsGen);

        for(j = 0; j < blockDataBytes; j++) {
          finalMessage[i + j * blockCnt] = bitBuffer.getDataArray()[dataOffset + j];;
        }
        if(extraByte) {
          finalMessage[i + j * blockCnt - shortBlockCnt] = bitBuffer.getDataArray()[dataOffset + j];
        }
        for(j = 0; j < blockECBytes; j++) {
          finalMessage[dataBytes + i + j * blockCnt] = ecData[j];
        }

        dataOffset += blockDataBytes + extraByte;
      }

      // Building QR symbol matrix and evaluating different mask patterns
      score = -1;
      for(i = 0; i < 8; i++) {
        symbol = this.__buildSymbol(finalMessage, i);
        j = this.__calculatePenaltyScore(symbol);
        if(score == -1 || j < score) {
          this.__symbol = symbol;
          m = i;
          score = j;
        }
      }

      // Adding format and version information to the matrix
      this.__fillReservedAreas(this.__symbol, m);
    },


    /**
     * Fills in QR symbol matrix with data codewords, finder, timing and
     * alignment patterns, separators and reserved areas.
     *
     * @param message {Integer[]} Array of data codewords
     * @param maskPattern {Integer} Mask pattern index
     *
     * @return {Integer[]} QR symbol matrix
     */
    __buildSymbol : function(message, maskPattern) {
      var i, j, x, y, bit, dir, p, symbol, maskFunc;

      symbol = new Array(this.__symbolSize * this.__symbolSize);

      // Adding finder patterns
      this.__createPattern(symbol, this.__finderPattern, 0, 0, 7);
      this.__createPattern(symbol, this.__finderPattern, 0, this.__symbolSize - 7, 7);
      this.__createPattern(symbol, this.__finderPattern, this.__symbolSize - 7, 0, 7);

      // Adding separators and reserving format information areas
      for(i = 0; i < 8; i++) {
        // top left separator
        symbol[i + 7 * this.__symbolSize] = false;
        symbol[7 + i * this.__symbolSize] = false;
        // + reserved area
        symbol[i + 8 * this.__symbolSize] = false;
        symbol[8 + i * this.__symbolSize] = false;

        // bottom left separator
        symbol[i + (this.__symbolSize - 8) * this.__symbolSize] = false;
        symbol[7 + (this.__symbolSize - i - 1) * this.__symbolSize] = false;
        // + reserved area
        symbol[8 + (this.__symbolSize - i - 1) * this.__symbolSize] = false;

        // top right separator
        symbol[8 * this.__symbolSize - i - 1] = false;
        symbol[(i + 1) * this.__symbolSize - 8] = false;
        // + reserved area
        symbol[9 * this.__symbolSize - i - 1] = false;
      }

      // Reserving version information areas (if necessary)
      if(this.__symbolVersion >= 7) {
        for(j = 0; j < 6; j++) {
          for(i = this.__symbolSize - 11; i < this.__symbolSize - 8; i++) {
            symbol[i + j * this.__symbolSize] = false;
            symbol[i * this.__symbolSize + j] = false;
          }
        }
      }

      // This module is also part of format information area
      symbol[8 + 8 * this.__symbolSize] = false;
      // Black module
      symbol[8 + (this.__symbolSize - 8) * this.__symbolSize] = true;

      // Adding alignment patterns
      if(this.__symbolVersion >= 2) {
        p = qrcode.QRCode.__alignPatternPositions[this.__symbolVersion - 2];
        for(x = 0; x < p.length; x++) {
          for(y = 0; y < p.length; y++) {
            if(typeof symbol[(p[y] * this.__symbolSize + p[x])] === 'undefined') {
              this.__createPattern(symbol, this.__alignmentPattern, p[x] - 2, p[y] - 2, 5);
            }
          }
        }
      }

      // Adding timing pattern
      for(i = 8; i < this.__symbolSize - 8; i++) {
        symbol[6 * this.__symbolSize + i] = ((i & 0x1) == 0);
        symbol[i * this.__symbolSize + 6] = ((i & 0x1) == 0);
      }

      // Placing data modules
      maskFunc = qrcode.QRCode.__maskFunctions[maskPattern];
      bit = 0x80;
      x = y = this.__symbolSize - 1;
      dir = -1;
      i = 0;
      for(;;) {
        j = x + y * this.__symbolSize;
        if(typeof symbol[j] === 'undefined') {
          symbol[j] = maskFunc((message[i] & bit) != 0, x, y);
          if(bit > 0x1) {
            bit >>>= 1;
          }
          else {
            i++;
            if(i == message.length) {
              break;
            }
            bit = 0x80;
          }
        }

        if((x & 0x1) == (x < 6) ? 1 : 0) {
          x--;
        }
        else {
          x++;
          y += dir;
          if(y < 0 || y == this.__symbolSize) {
            dir = -dir;
            y += dir;
            x -= 2 - ((x == 6) ? 1 : 0);
          }

          if(x < 0) {
            // This should never happen
            throw new Error("Internal error: too many data for a single QR code symbol.");
          }
        }
      }

      return symbol;
    },


    /**
     * Adds format and version information to the QR symbol matrix
     *
     * @param symbol {Integer[]} QR symbol matrix
     * @param maskPattern {Integer} Mask pattern index
     */
    __fillReservedAreas : function(symbol, maskPattern) {
      var i, j, code;

      // Adding format information
      code = (this.__ecLevel << 3) | (maskPattern & 0x7);
      code = this.__calculateSmallECCode(code, 10, 0x537) ^ 0x5412;
      for(i = 0; i < 8; i++) {
        // top left
        symbol[8 + (i + ((i < 6) ? 0 : 1)) * this.__symbolSize] = ((code & 0x1) != 0);
        symbol[8 * this.__symbolSize + 8 - i - ((i < 2) ? 0 : 1)] = ((code & 0x80) != 0);

        // bottom left
        if(i > 0) {
          symbol[8 + (this.__symbolSize - 8 + i) * this.__symbolSize] = ((code & 0x80) != 0);
        }

        // top right
        symbol[9 * this.__symbolSize - i - 1] = ((code & 0x1) != 0);

        code >>= 1;
      }

      // Adding version information (if necessary)
      if(this.__symbolVersion >= 7) {
        code = this.__calculateSmallECCode(this.__symbolVersion, 12, 0x1F25);
        for(j = 0; j < 6; j++) {
          for(i = this.__symbolSize - 11; i < this.__symbolSize - 8; i++) {
            symbol[i + j * this.__symbolSize] = ((code & 0x1) != 0);
            symbol[i * this.__symbolSize + j] = ((code & 0x1) != 0);
            code >>= 1;
          }
        }
      }
    },


    /**
     * Finder pattern generating function
     *
     * @param x {Integer} The horizontal offset of the module inside the pattern
     * @param y {Integer} The vertical offset of the module inside the pattern
     *
     * @return {Boolean} <code>true</code> if the given module is dark, <code>false</code>
     *   otherwise
     */
    __finderPattern : function(x, y) {
      // First check if module at (x, y) falls into the black pattern border.
      // If it does not, then check that it does not fall into the inner light
      // frame (which means it falls into the dark center).
      return (x == 0 || x == 6 || y == 0 || y == 6)
          || (x != 1 && x != 5 && y != 1 && y != 5);
    },



    /**
     * Alignment pattern generating function
     *
     * @param x {Integer} The horizontal offset of the module inside the pattern
     * @param y {Integer} The vertical offset of the module inside the pattern
     *
     * @return {Boolean} <code>true</code> if the given module is dark, <code>false</code>
     *   otherwise
     */
    __alignmentPattern : function(x, y) {
      return x == 0 || x == 4 || y == 0 || y == 4 || (x == 2 && y == 2);
    },


    /**
     * Creates pattern on the QR symbol matrix
     *
     * @param symbol {Integer[]} QR symbol matrix
     * @param pattern {Function} Pattern generating function
     * @param x {Integer} The horizontal offset of the pattern inside the matrix
     * @param y {Integer} The vertical offset of the pattern inside the matrix
     * @param size {Integer} The size of each side of the pattern
     *
     */
    __createPattern : function(symbol, pattern, x, y, size) {
      var i = y * this.__symbolSize + x;
      for(y = 0; y < size; y++) {
        for(x = 0; x < size; x++) {
          symbol[i++] = pattern(x, y);
        }
        i += this.__symbolSize - size;
      }
    },


    /**
     * Calculates BCH error correction codes
     *
     * Inspired by {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders}.
     *
     * @param data {Integer} Input data
     * @param len {Integer} Length of <code>data</code> in bits
     * @param gen {Integer} Generator polynomial
     *
     * @return {Integer} Calculated error correction code appended to the <code>data</code>
     */
    __calculateSmallECCode : function(data, len, gen) {
      var r, g, b1, b2;

      r = data << len;
      b1 = 1 << len;
      while(r >= b1) {
        g = gen;
        for(b2 = b1 << 1; b2 < r; b2 <<= 1) {
          g <<= 1;
        }
        r ^= g;
      }

      return (data << len) | r;
    },


    /**
     * Implements Galois field GF(2^8) multiplication
     *
     * Inspired by {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders}.
     *
     * @param a {Integer}
     * @param b {Integer}
     * @return {Integer}
     */
    __rsMul : function(a, b) {
      var clazz = qrcode.QRCode;
      return (a && b) ? clazz.__rs_exp_tbl[clazz.__rs_log_tbl[a] + clazz.__rs_log_tbl[b]] : 0;
    },


    /**
     * Implements Galois field GF(2^8) polynomial multiplication
     *
     * Inspired by {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders}.
     *
     * @param p1 {Integer[]}
     * @param p2 {Integer[]}
     * @return {Integer[]}
     */
    __rsPolyMod : function(p1, p2) {
      var r, c, i, j, len, len2;

      r = p1.slice();
      len2 = p2.length;
      len = p1.length - len2 + 1;
      for(i = 0; i < len; i++) {
        c = r[i];
        if(c) {
          for(j = 1; j < len2; j++) {
            r[i+j] ^= this.__rsMul(p2[j], c);
          }
        }
      }

      return r.splice(-(len2-1));
    },


    /**
     * Calculates Reed-Solomon generator polynomial
     *
     * Inspired by {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders}.
     *
     * @param degree {Integer} The degree of the polynomial
     *
     * @return {Integer[]} Generator Polynomial
     */
    __rsCalculateGenerator : function(degree) {
      var clazz = qrcode.QRCode;
      var r, i, j;

      r = Array(degree + 1);
      r[0] = 1;
      for(i = 0; i < degree; i++) {
        for(j = i; j >= 0; j--) {
          r[j+1] ^= this.__rsMul(r[j], clazz.__rs_exp_tbl[i]);
        }
      }

      return r;
    },


    /**
     * Calculates penalty score for the given QR symbol
     *
     * @param symbol {Integer[]} QR symbol matrix
     *
     * @return {Integer} Penalty score
     */
    __calculatePenaltyScore : function(symbol) {
      var score, i, j, k, end, c, s, seq, len;

      score = 0;

      // Checking for adjacent modules in rows
      for(i = 0; i < this.__symbolSize; i++) {
        c = symbol[i * this.__symbolSize];
        end = (i + 1) * this.__symbolSize;
        s = 1;
        for(j = 1 + i * this.__symbolSize; j < end; j++) {
          if(!c == !symbol[j]) {
            s++;
          }
          else {
            if(s >= 5) {
              score += s - 2;
            }
            s = 1;
            c = symbol[j];
          }
        }
        if(s >= 5) {
          score += s - 2;
        }
      }

      // Checking for adjacent modules in columns
      end = this.__symbolSize * this.__symbolSize;
      for(i = 0; i < this.__symbolSize; i++) {
        c = symbol[i];
        s = 1;
        for(j = i + this.__symbolSize; j < end; j += this.__symbolSize) {
          if(!c == !symbol[j]) {
            s++;
          }
          else {
            if(s >= 5) {
              score += s - 2;
            }
            s = 1;
            c = symbol[j];
          }
        }
        if(s >= 5) {
          score += s - 2;
        }
      }

      // Checking for solid blocks of modules
      for(j = 1; j < this.__symbolSize; j++) {
        for(i = 1; i < this.__symbolSize; i++) {
          s = i + j * this.__symbolSize;
          c = symbol[s];
          if(!c == !symbol[s-1]
              && !c == !symbol[s-this.__symbolSize]
              && !c == !symbol[s-this.__symbolSize-1]) {

            score += 3;
          }
        }
      }

      // Checking for finder-pattern-like sequences
      seq = qrcode.QRCode.__penaltySequence;
      len = seq.length;
      for(i = 0; i <= this.__symbolSize - len; i++) {
        for(j = 0; j < this.__symbolSize; j++) {
          // Scanning row
          s = i + j * this.__symbolSize;
          for(k = 0; k < len; k++) {
            if(!seq[k] != !symbol[s+k]) {
              break;
            }
          }
          if(k == len) {
            // Pattern found, now checking if it is preceeded of followed by 4 white modules
            if(i >= 4 && !symbol[s-1] && !symbol[s-2] && !symbol[s-3] && !symbol[s-4]) {
              score += 40;
            }
            else if(i + len + 4 < this.__symbolSize) {
              k = s + len;
              if(!symbol[k] && !symbol[k+1] && !symbol[k+2] && !symbol[k+3]) {
                score += 40;
              }
            }
          }

          // Similarly scanning column
          s = j + i * this.__symbolSize;
          for(k = 0; k < len; k++) {
            if(!seq[k] != !symbol[s + k * this.__symbolSize]) {
              break;
            }
          }
          if(k == len) {
            if(i >= 4 && !symbol[s - this.__symbolSize] && !symbol[s - 2 * this.__symbolSize]
                && !symbol[s - 3 * this.__symbolSize] && !symbol[s - 4 * this.__symbolSize]) {
              score += 40;
            }
            else if(i + len + 4 < this.__symbolSize) {
              k = s + len * this.__symbolSize;
              if(!symbol[k] && !symbol[k + this.__symbolSize] && !symbol[k + 2 * this.__symbolSize]
                  && !symbol[k + 3 * this.__symbolSize]) {
                score += 40;
              }
            }
          }
        }
      }

      // Checking for black to white ratio
      s = 0;
      len = this.__symbolSize * this.__symbolSize;
      for(i = 0; i < len; i++) {
        if(symbol[i]) {
          s++;
        }
      }

      k = Math.floor(10 * Math.abs((1 - 2 * s / len)));
      score += 10 * k;

      return score;
    }
  }
});
