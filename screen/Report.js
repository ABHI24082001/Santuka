import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, Button, TouchableOpacity,Image,Alert } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { encode } from 'base-64';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';



export default class Report extends Component {
  constructor(props) {
    super(props);
    const { route } = this.props;

    this.state = {
      tableHead: ['SL NO', 'TruckNo', 'Challan', 'TPNo', 'Loading Qty', 'Unloading Qty','Unloading Date', 'Cash', 'E-Adv', 'Hsd', 'Memo No', 'Pump Name', 'Remarks'],
      widthArr: [40, 150, 150, 150, 150, 150, 150,150, 150, 150, 150, 150, 150],
      tableData: [],
      currentPage: 1,
      perPage: 100,
      branchName: '',
      clientName: '',
      jobName: '',
      selectedDate: new Date(),
      dataAvailable: true,
      columnDataMapping: {
        'Loading Qty': 'NetWT', // Mapping 'Loading Qty' to 'NetWT'
        // Add more mappings as needed for other columns
      },
      username: route.params?.username || '',
      password: route.params?.password || ''

    };
    this.serialNumber = 0;

 this.handlePrintPDF = this.handlePrintPDF.bind(this);
    this.calculateSum = this.calculateSum.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }
  

 
  loadData = () => {
    this.serialNumber = 0; // Reset serialNumber to 0
    const { currentPage, perPage, branchName, clientName, jobName, selectedDate } = this.state;

   
console.log('username report',username)
console.log('password report',password)
    const base64Credentials = encode(`${username}:${password}`);

    const headers = new Headers({
      'Authorization': `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    });

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    let apiUrl = `http://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${branchName}`;

    if (clientName) {
      apiUrl += `&GetClientDetails?ClientName=${clientName}`;
    }

    if (jobName) {
      apiUrl += `&GetJobDetails?JobName=${jobName}`;
    }
    if (selectedDate) {
      apiUrl += `&selectedDate=${formattedSelectedDate}`;
    }

    fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.data.filter((row) => {
          const originalLoadDate = new Date(row['LoadDate']);
          const selectedDateFormatted = new Date(selectedDate);
          return originalLoadDate.toDateString() === selectedDateFormatted.toDateString();
        });
        // Update the table data with the filtered data
        this.setState({ tableData: filteredData, dataAvailable: filteredData.length > 0 });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.setState({ dataAvailable: false });
      });
  }

  loadNextPage = () => {
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage + 1 }),
      this.loadData
    );
  }

  loadPreviousPage = () => {
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage - 1 }),
      this.loadData
    );
  }

  handleDateFilter = () => {
    const formattedSelectedDate = moment(this.state.selectedDate).format('DD-MM-YYYY');
    console.log('Selected Date:', formattedSelectedDate);

    this.loadData();
  }

  // Function to calculate the sum of the 'Cash' column
  calculateCashSum = () => {
    const { tableData } = this.state;
    let cashSum = 0;
    for (const rowData of tableData) {
      if (rowData.Cash !== null) {
        cashSum += parseFloat(rowData.Cash);
      }
    }
    return cashSum;
  }

  // Function to calculate the sum of the 'Hsd' column
  calculateHsdSum = () => {
    const { tableData } = this.state;
    let hsdSum = 0;
    for (const rowData of tableData) {
      if (rowData.Hsd !== null) {
        hsdSum += parseFloat(rowData.Hsd);
      }
    }
    return hsdSum;
  }

  // Function to calculate the sum of the 'E-Adv' column
  calculateEAdvSum = () => {
    const { tableData } = this.state;
    let eAdvSum = 0;
    for (const rowData of tableData) {
      if (rowData['E-Adv'] !== null) {
        eAdvSum += parseFloat(rowData['E-Adv']);
      }
    }
    return eAdvSum;
  }

  calculateSum = (columnName) => {
    const { tableData } = this.state;
    let sum = 0;
  
    for (const rowData of tableData) {
      const columnValue = rowData[columnName];
  
      if (!isNaN(columnValue) && parseFloat(columnValue) !== 0) {
        sum += parseFloat(columnValue);
      }
    }
  
    return !isNaN(sum) && sum !== 0 ? sum : ''; // Display empty string if the sum is NaN or 0
  }
  
  

  handlePrintPDF = async () => {
    console.log('Printing PDF...');
    console.log('tableHead:', this.state.tableHead);
    console.log('tableData:', this.state.tableData);

    // Check if both table header and data are available
    if (this.state.tableHead.length === 0 || this.state.tableData.length === 0) {
      console.warn('Table header or data is empty. PDF will not be generated.');
      return;
    }
    const selectedDate = moment(this.state.selectedDate).format('DD/MM/YYYY');

const htmlContent = `
<html>
  <head>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 4px;
        text-align: center;
      }
      h1, h2 {
        text-align: center;
      }
      h3 {
        text-align: left;
        margin-left: 10px;
        margin-bottom: 10px;
      }
      h4 {
        text-align: right;
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    <h1>SANTUKA TRANSPORT</h1>
    <h2>NIE, JAGATPUR, CUTTACK</h2>
    
    <h4>Date: ${selectedDate}</h4>

    <table>
      <thead>
        <tr>
          ${this.state.tableHead.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${this.state.tableData.map((row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row['TruckNo'] !== undefined ? row['TruckNo'] : ''}</td>
            <td>${row['Challan'] !== undefined ? row['Challan'] : ''}</td>
            <td>${row['TPNo'] !== undefined ? row['TPNo'] : ''}</td>
            <td>${row['TareWT'] !== undefined ? row['TareWT'].toFixed(3) : ''}</td>
            <td>${row['Unloading Qty'] !== undefined ? row['Unloading Qty'] : ''}</td>
            <td>${row['Unloading Date'] !== undefined ? moment(row['Unloading Date']).format('DD-MM-YYYY') : ''}</td>
            <td>${row['Cash'] !== undefined && parseFloat(row['Cash']) !== 0 ? row['Cash'].toFixed(2) : ''}</td>
            <td>${row['E-Adv'] !== undefined && parseFloat(row['E-Adv']) !== 0 ? row['E-Adv'].toFixed(2) : ''}</td>
            <td>${row['Hsd'] !== undefined && parseFloat(row['Hsd']) !== 0 ? row['Hsd'].toFixed(2) : ''}</td>
            <td>${row['Memo No'] !== undefined ? row['Memo No'] : ''}</td>
            <td>${row['Pump Name'] !== undefined ? row['Pump Name'] : ''}</td>
            <td>${row['Remarks'] !== undefined ? row['Remarks'] : ''}</td>
          </tr>
        `).join('')}

        <tr>
          <td colspan="4">Total</td>
          <td>${this.calculateSum('TareWT')}</td>
          <td colspan="2"></td>
          <td>${this.calculateSum('Cash')}</td>
          <td>${this.calculateSum('E-Adv')}</td>
          <td>${this.calculateSum('Hsd')}</td>
          <td colspan="4"></td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

    
    // Log the HTML content
    console.log('HTML Content:', htmlContent);
    
  

    const selectedDatee = moment(this.state.selectedDate).format('DD_MM_YYYY_HH_mm_ss');
    const fileName = `report_${selectedDatee}`;
  
    const options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Documents',
    };
  
    try {
      const file = await RNHTMLtoPDF.convert(options);
  
      // Move the file to the Downloads directory
      const sourcePath = file.filePath;
      const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;
  
      await RNFS.moveFile(sourcePath, destinationPath);
  
      console.log('PDF generated and moved successfully:', destinationPath);
  
      // Show an alert or any other UI feedback for successful generation and move
      Alert.alert('Success', 'PDF generated and saved to Downloads');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'PDF generation failed');
    }
  };
  render() {
    const state = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.branchHeader}>
          SANTUKA TRANSPORT
        </Text>
        <Text style={styles.branchSubHeader}>
          NIE, JAGATPUR, CUTTACK
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputColumn}>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              placeholder="Branch Name"
              placeholderTextColor="black"
              value={state.branchName}
              color="black"
              onChangeText={(text) => this.setState({ branchName: text })}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputColumn}>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              placeholder="Job Name"
              placeholderTextColor="black"
              color="black"
              value={state.jobName}
              onChangeText={(text) => this.setState({ jobName: text })}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputColumn}>
            <TextInput
              style={[styles.input, { width: '48%' }]}
              placeholder="Client Name"
              placeholderTextColor="black"
              color="black"
              value={state.clientName}
              onChangeText={(text) => this.setState({ clientName: text })}
            />
            <TextInput
              style={[styles.input, { width: '25%' }]}
              placeholder="Selected Date"
              placeholderTextColor="black"
              color="black"
              value={moment(state.selectedDate).format('DD-MM-YYYY')}
              editable={false} // Make it read-only
            />
          </View>
        </View>
        {/* Inside the render method */}
        <View style={styles.printButtonContainer}>
          <TouchableOpacity onPress={this.handlePrintPDF}>
            {/* Replace with the Image component */}
            <Image
              source={require('./assets/printer.png')} // Replace with the correct path
              style={{ width: 30, height: 30, tintColor: 'black' }} // Adjust the dimensions and color
            />
          </TouchableOpacity>
        </View>
        <View style={styles.filterContainer}>
          <View style={styles.buttonContainer}>
            <Button title="Select Date" onPress={() => this.setState({ showDatePicker: true })} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Filter" onPress={this.handleDateFilter} />
          </View>
        </View>
        {state.showDatePicker && (
          <DateTimePicker
            value={state.selectedDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(event, date) => {
              if (date !== undefined) {
                this.setState({ selectedDate: date, showDatePicker: false });
              } else {
                this.setState({ showDatePicker: false });
              }
            }}
          />
        )}
        <ScrollView horizontal={true}>
          <View>
            <Table borderStyle={{ borderColor: 'black' }}>
              <Row data={state.tableHead} widthArr={state.widthArr} style={[styles.header, { borderWidth: 1 }]} textStyle={styles.text} />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              {state.dataAvailable ? (
                state.tableData.map((rowData, index) => {
                  const slNo = index + 1;
                  return (
                    <Table
                      borderStyle={{ borderColor: 'black' }}
                      key={index}
                    >
                      <Row
                        data={state.tableHead.map((header) => {
                          if (header === 'LoadDate') {
                            return rowData[header] !== undefined
                              ? moment(rowData[header]).format('DD-MM-YYYY')
                              : '';
                          } else {
                            // Check if the value is '0' in 'Cash', 'Hsd', or 'E-Adv', and replace with an empty string
                            const columnName = state.columnDataMapping[header] || header;
                            const cellValue = header === 'SL NO'
                            ? slNo
                            : rowData[columnName] !== undefined
                              ? ['Cash', 'Hsd', 'E-Adv'].includes(header) && parseFloat(rowData[columnName]) === 0
                                ? '' // Replace '0' with an empty string in the specified columns
                                : ['Loading Qty'].includes(header) // Format 'Loading Qty' to three decimal places
                                  ? parseFloat(rowData[columnName]).toFixed(3)
                                  : ['Cash', 'Hsd', 'E-Adv'].includes(header) // Format 'Cash', 'Hsd', 'E-Adv' to two decimal places
                                    ? parseFloat(rowData[columnName]).toFixed(2)
                                    : rowData[columnName].toString()
                              : '';
                          
                            return (
                              <Text style={styles.tableCell}>
                                {cellValue}
                              </Text>
                            );
                          }
                        })}
                        widthArr={state.widthArr}
                        style={[
                          styles.row,
                          { borderWidth: 1, borderColor: 'black' },
                          index % 2 && { backgroundColor: '#F7F6E7' }
                        ]}
                        textStyle={styles.text}
                      />
                    </Table>
                  );
                })
              ) : (
                <Text style={styles.noDataText}>Data not available for the selected date.</Text>
              )}

              {state.dataAvailable && state.tableData.length > 0 && (
               <Table borderStyle={{ borderColor: 'black' }}>
               <Row
                 data={state.tableHead.map((header) => {
                   if (header === 'SL NO') {
                     return ''; // Leave it empty for the footer row
                   } else if (header === 'Cash') {
                     const cashSum = this.calculateCashSum();
                     return cashSum > 0 ? cashSum.toFixed(2) : ''; // Display empty cell if sum is not available
                   } else if (header === 'Hsd') {
                     const hsdSum = this.calculateHsdSum();
                     return hsdSum > 0 ? hsdSum.toFixed(2) : ''; // Display empty cell if sum is not available
                   } else if (header === 'E-Adv') {
                     const eAdvSum = this.calculateEAdvSum();
                     return eAdvSum > 0 ? eAdvSum.toFixed(2) : ''; // Display empty cell if sum is not available
                   } else if (header === 'Loading Qty') {
                     const loadingQtySum = this.calculateSum('Loading Qty');
                     return loadingQtySum > 0 ? loadingQtySum.toFixed(3) : ''; // Display empty cell if sum is not available
                   } else {
                     return '';
                   }
                 })}
                 widthArr={state.widthArr}
                 style={styles.row}
                 textStyle={styles.text}
               />
             </Table>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.pagination}>
          <TouchableOpacity onPress={this.loadPreviousPage} disabled={state.currentPage === 1}>
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.paginationText}>Page {state.currentPage}</Text>
          <TouchableOpacity
            onPress={this.loadNextPage}
            disabled={state.tableData.length < state.perPage}
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: '#fff' },
  branchHeader: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'black' },
  branchSubHeader: { fontSize: 18, textAlign: 'center', color: 'black' },  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#C1C0B9',
    marginBottom: 10,
  },
  inputColumn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    width: '48%',
    borderColor: 'black',
  },
  header: { height: 50, backgroundColor: '#537791' },
  text: { textAlign: 'center', fontWeight: 'bold', color: 'black' },
  dataWrapper: { marginTop: -1 },
  row: { height: 50, backgroundColor: '#ffff' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  paginationText: { margin: 10, fontSize: 16, color: 'black' },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#C1C0B9',
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    margin: 5,
  },
  noDataText: { textAlign: 'center', color: 'red', marginTop: 10 },
  tableCell: {
    height:50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    padding: 10, // Adjust the padding as needed
    color:'black',
  },
  // Add this to your existing styles
printButtonContainer: {
  position: 'absolute',
  top: 50,
  right: 15,
  margin: 10,
},
printButtonText: {
  fontSize: 16,
  color: 'black', // Adjust color as needed
  fontWeight:'bold',
},

});
