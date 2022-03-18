const assert = require('assert');
const {fmid} = require('../dist/utils.js');

describe('[Utils fmid test]', function() {
   
  it("id length equal 8", () => {
    const id = fmid(8);
    assert.equal(id.length, 8, "the length is not 8")
  })

  it("id_1 not equal id_2", () => {
    const id_1 = fmid(8);
    const id_2 = fmid(8);
    assert.notStrictEqual(id_1, id_2, "id_1 is equal id_2")
  })
})