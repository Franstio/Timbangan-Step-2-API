import { SerialPort } from 'serialport';





let _4kgOutput = '';
let _50kgOutput = '';
export const getScales4Kg = (io) => {
    try {
//        console.log(process.env.TIMBANGAN4KG);
        if (process.env.TIMBANGAN4KG != "1")
            return;
        const Timbangan = new SerialPort({
            path: '/dev/ttyUSB1',
            baudRate: 9600,
            dataBits: 8,
            lock:false,
            rtscts:true,
            stopBits: 1,
            parity: 'none',
        });
        Timbangan.on('error', (error) => {
            console.log({kg4Error: error});
            Timbangan.close();
            getScales4Kg(io);
            return;
        });
        let response;
        io.on('connectScale', () => {
            Timbangan.open(() => {
            });
        });
       Timbangan.on('data', (data) => {
            let temp = data.toString();
            if (temp.length < 5)
            {
                if (temp != '\n'  && temp != ' ' && temp != '\t' && temp != '\0')
                {
                    _4kgOutput += temp;
                    return;
                }
            }
            _4kgOutput = _4kgOutput.replace("\n","").replace("\r","");
            const match = processWeight(_4kgOutput,io);
            
            _4kgOutput = '';
            if (!match ) {
                Timbangan.close();
                getScales4Kg(io);
            }
        });  
    } catch (error) {
        console.log(error);
        getScales4Kg(io);
        return;
        //        res.status(500).json({ msg: error.message });
    } 
};
const processWeight = async (payload,io) =>{
    const match4 = payload.toString().match(/[\d]+\.\d{2}(?=Kg)/);
    const match = payload.toString().match(/WT:(\d+\.\d+)g/);
    if (match4 ) {
        const weight =  match4[1] ;
        response = { weight: parseFloat(weight) };
        io.emit('data', response);
        return true;
    }
    else if (match) {
        const weight = match[0];
        response = { weight: parseFloat(weight) };
        response = { weight50Kg: weight };
        io.emit('data1', response);
        return true;
    }
    else
        return false;
    
}
export const getScales50Kg = (io) => {
    try {
  //      console.log(process.env.TIMBANGAN50KG);
        if (process.env.TIMBANGAN50KG != "1")
            return;
        const Timbangan_1 = new SerialPort({
            path: '/dev/ttyUSB0',
            lock:false,
            rtscts:true,
            
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        }); 
        
        let response;
        Timbangan_1.on('data', (data) => {
            let temp = data.toString();
            if (temp.length < 5)
            {
                if (temp != '\n'  && temp != ' ' && temp != '\t' && temp != '\0')
                {
                    _50kgOutput += temp;
                    return;
                }
            }
            _50kgOutput = temp.replace("\r","").replace("\n","");
            const match = processWeight(_50kgOutput,io);
            _50kgOutput = '';
            if (!match) {
                Timbangan_1.close();
                getScales50Kg(io);
            }
        });

       Timbangan_1.on('error', (error) => {
            console.log({kg50Error: error});
            Timbangan_1.close();
            getScales50Kg(io);
            return;
        }); 
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.log(error);
        getScales50Kg(io);
        return;
        //    res.status(500).json({ msg: error.message });
    }
};
