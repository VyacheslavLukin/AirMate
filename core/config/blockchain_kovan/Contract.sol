contract HackForClimate {
    //regionid -> (timeshtamp -> numberblock )
    mapping (uint256 => mapping (uint256 => string)) datamap;

    event TransferData(string , uint256 timeshtamp, string numberblock);


    function saveData(uint256 regionid, uint256 timeshtamp,string numberblock) returns (bool) {

    datamap[regionid][timeshtamp] = numberblock;
    TransferData("save data", timeshtamp, datamap[regionid][timeshtamp]);
    return true;
  }

    function getData(uint256 regionid, uint256 timeshtamp) returns (string) {

     string numberblock =datamap[regionid][timeshtamp];
    TransferData("get data", timeshtamp, numberblock);
    return numberblock;
  }
}
