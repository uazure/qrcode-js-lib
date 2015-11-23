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
 * Bit buffer implementaion
 *
 * @internal
 */
qx.Bootstrap.define("qrcode.BitBuffer",
{
  extend : Object,

  /**
   * @param len {Integer}
   */
  construct : function(len)
  {
    this.base(arguments);

    if(len) {
      len = Math.ceil(len / 8);
    }

    this.__data = new Array(/*len*/);
    this.__bitsLeft = 0;
  },


  statics :
  {
    __masks : [ 0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff ]
  },


  members :
  {
    __data : null,
    __bitsLeft : null,


    /**
     * Appends <code>numBits</code> most significant bits of the <code>val</code>.
     * The full length of the <code>val</code> can be specified via the
     * <code>valLen</code> parameter; if it is omitted the full length of the
     * <code>val</code> is considered to be <code>numBits</code>.
     *
     * @param val {Integer} The value to be appended
     * @param numBits {Integer} The number of bits to be appended
     * @param valLen {Integer?numBits} The length of the <code>val</code> in bits
     */
    append : function(val, numBits, valLen) {
      var idx, n;

      if(valLen == undefined) {
        valLen = numBits;
      }

      idx = this.__data.length - 1;

      while(numBits > 0) {
        if(this.__bitsLeft == 0) {
          this.__data.push(0);
          this.__bitsLeft = 8;
          idx++;
        }

        n = Math.min(numBits, this.__bitsLeft);
        this.__data[idx] |= ((val >> (valLen - n)) & qrcode.BitBuffer.__masks[n]) << (this.__bitsLeft - n);
        this.__bitsLeft -= n;
        numBits -= n;
        valLen -= n;
      }
    },


    /**
     * Returns the length of the data in the buffer
     *
     * @return {Integer} The number of data bits stored in the buffer
     */
    getLength : function() {
      return 8 * this.__data.length - this.__bitsLeft;
    },


    /**
     * Returns the data stored in the buffer
     *
     * @return {Integer[]} Array of 8-bit values. The last array element is
     *   zero-padded to 8-bit length if neccessary.
     */
    getDataArray : function() {
      return this.__data;
    }
  }
});
