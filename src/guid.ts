export class Guid {
    static newGuid() {
        var guidArray = new Array<string>();
        for (var index = 0; index < 8; index++) {
            var keyValue = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            guidArray.push(keyValue);
        }
        var guid = guidArray[0] + guidArray[1]
            + "-" + guidArray[2] + "-" + guidArray[3]
            + "-" + guidArray[4] + "-" + guidArray[5]
            + guidArray[6] + guidArray[7];
        return guid;
    }
}

export default Guid;