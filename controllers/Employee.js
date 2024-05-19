import Users from "../models/EmployeeModel.js"
import Container from "../models/ContainerModel.js";
import Waste from "../models/WasteModel.js";
import Bin from "../models/BinModel.js";
import transaction from "../models/TransactionModel.js"
import moment from 'moment';

export const ScanBadgeid = async (req, res) => {
    console.log(req.body);
    const { badgeId } = req.body;
    try {
        const user = await Users.findOne({ attributes: ['badgeId',"username"], where: { badgeId } });
        if (user) {
            res.json({ user: user });
        } else {
            res.json({ error: 'Badge ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server'  });
    }
};

export const ScanContainer = async (req, res) => {
    const { containerId } = req.body;
    try {
        const container = await Container.findOne({
            attributes: ['containerId', 'name', 'station', 'weightbin', 'IdWaste'],
            include: [
                {
                    model: Waste,
                    as: 'waste',
                    required: true,
                    duplicating: false,
                    attributes: ['name'],
                    include: [
                {
                    model: Bin,
                    as: 'bin',
                    required: true,
                    duplicating: false,
                    attributes: ['name', 'id', 'IdWaste']
                }
                    ]
                }
            ],
            where: { name: containerId }
        });

        if (container) {
            res.json({ container:container });
        } else {
            res.json({ error: 'Container ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const CheckBinCapacity = async (req, res) => {
    const { IdWaste, neto } = req.body;
console.log(IdWaste);
    try {
        // Mengambil semua tempat sampah yang sesuai dengan type_waste dari database
        const bins = await Bin.findAll({
            where: {
                IdWaste: IdWaste
            }
        });

        // Jika tidak ada tempat sampah yang ditemukan untuk type_waste yang diberikan
        if (!bins || bins.length === 0) {
            return res.status(404).json({ success: false, message: 'No bins found for the given waste type' });
        }

        // Menyaring tempat sampah yang memiliki kapasitas cukup untuk neto
        let eligibleBins = bins.filter(bin => (parseFloat(bin.weight) + parseFloat(neto)) <= parseFloat(bin.max_weight));

        // Jika tidak ada tempat sampah yang memenuhi kapasitas
        if (eligibleBins.length === 0) {
            return res.status(200).json({ success: false, message: 'No bins with enough capacity found' });
        }

        // Mengurutkan tempat sampah berdasarkan kapasitas yang paling kosong terlebih dahulu
        eligibleBins = eligibleBins.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));
        
        // Memilih tempat sampah yang paling kosong
        let selectedBin = eligibleBins[0];

        res.status(200).json({ success: true, bin: selectedBin });
    } catch (error) {
        console.error('Error checking bin capacity:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const SaveTransaksi = async (req,res) => {
    const {payload} = req.body;
    payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(payload);
    (await transaction.create(payload)).save();
    res.status(200).json({msg:'ok'});
};

export const UpdateBinWeight = async (req,res) =>{
    const {binId,neto} = req.body;
    const data = await Bin.findOne({where: {id:binId}});
    data.weight = parseFloat(neto) + parseFloat(data.weight);
    data.save();
   // await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
    res.status(200).json({msg:'ok'});
}

