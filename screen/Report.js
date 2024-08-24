import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {Table, Row} from 'react-native-table-component';
import {encode} from 'base-64';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

export default class Report extends Component {
  constructor(props) {
    super(props);
    const {route} = this.props;
    this.state = {
      tableHead: [
        'SL NO',
        'TruckNo',
        'Challan',
        'TPNo',
        'Loading Qty',
        'Unloading Qty',
        'Unloading Date',
        'Cash',
        'E-Adv',
        'Hsd',
        'Memo No',
        'Pump Name',
        'Remarks',
      ],
      widthArr: [
        40, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150,
      ],
      tableData: [],
      currentPage: 1,
      perPage: 100,
      branchName: '',
      clientName: '',
      jobName: '',
      selectedDate: new Date(),
      dataAvailable: true,
      columnDataMapping: {
        'Loading Qty': 'NetWT',
      },
      username: route.params?.username || '',
      password: route.params?.password || '',
      showDatePicker: false,
    };
    this.serialNumber = 0;
    this.handlePrintPDF = this.handlePrintPDF.bind(this);
    this.calculateSum = this.calculateSum.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.serialNumber = 0;
    const {
      currentPage,
      perPage,
      branchName,
      clientName,
      jobName,
      selectedDate,
      username,
      password,
    } = this.state;
    console.log('branch report', branchName);
    console.log('username report', username);
    console.log('password report', password);
    console.log('clientName', clientName);
    console.log('jobName', jobName);
    console.log('jobName', password);
    const base64Credentials = encode(`${username}:${password}`);

    const headers = new Headers({
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    });

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    let apiUrl = `http://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${branchName}`;

    console.log('branch report', apiUrl);

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
      .then(response => response.json())
      .then(data => {
        const filteredData = data.data.filter(row => {
          const originalLoadDate = new Date(row['LoadDate']);
          const selectedDateFormatted = new Date(selectedDate);
          return (
            originalLoadDate.toDateString() ===
            selectedDateFormatted.toDateString()
          );
        });
        // Update the table data with the filtered data
        this.setState({
          tableData: filteredData,
          dataAvailable: filteredData.length > 0,
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({dataAvailable: false});
      });
  };

  // loadData = () => {
  //   this.serialNumber = 0;
  //   const {
  //     currentPage,
  //     perPage,
  //     branchName,
  //     clientName,
  //     jobName,
  //     selectedDate,
  //     username,
  //     password,
  //   } = this.state;
  // const base64Credentials = encode(`${username}:${password}`);

  // const headers = new Headers({
  //   Authorization: `Basic ${base64Credentials}`,
  //   'Content-Type': 'application/json',
  // });

  // const startIndex = (currentPage - 1) * perPage;
  // const endIndex = startIndex + perPage;
  // const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(
  //   selectedDate.getMonth() + 1,
  // ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // let apiUrl = `http://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${branchName}`;

  // if (clientName) {
  //   apiUrl += `&GetClientDetails?ClientName=${clientName}`;
  // }

  // if (jobName) {
  //   apiUrl += `&GetJobDetails?JobName=${jobName}`;
  // }
  // if (selectedDate) {
  //   apiUrl += `&selectedDate=${formattedSelectedDate}`;
  // }
  // fetch(apiUrl, {
  //   method: 'GET',
  //   headers: headers,
  // })
  //   .then(response => response.json())
  //   .then(data => {
  //     const filteredData = data.data.filter(row => {
  //       const originalLoadDate = new Date(row['LoadDate']);
  //       const selectedDateFormatted = new Date(selectedDate);
  //       return (
  //         originalLoadDate.toDateString() ===
  //         selectedDateFormatted.toDateString()
  //       );
  //     });
  //     this.setState({
  //       tableData: filteredData,
  //       dataAvailable: filteredData.length > 0,
  //     });
  //   })
  //   .catch(error => {
  //     console.error('Error fetching data:', error);
  //     this.setState({dataAvailable: false});
  //   });

  // };

  loadNextPage = () => {
    this.setState(
      prevState => ({currentPage: prevState.currentPage + 1}),
      this.loadData,
    );
  };

  loadPreviousPage = () => {
    this.setState(
      prevState => ({currentPage: prevState.currentPage - 1}),
      this.loadData,
    );
  };

  handleDateFilter = () => {
    const formattedSelectedDate = moment(this.state.selectedDate).format(
      'DD-MM-YYYY',
    );
    console.log('Selected Date:', formattedSelectedDate);

    this.loadData();
  };

  // Function to calculate the sum of the 'Cash' column
  calculateCashSum = () => {
    const {tableData} = this.state;
    let cashSum = 0;
    for (const rowData of tableData) {
      if (rowData.Cash !== null) {
        cashSum += parseFloat(rowData.Cash);
      }
    }
    return cashSum;
  };

  calculateHsdSum = () => {
    const {tableData} = this.state;
    let hsdSum = 0;
    for (const rowData of tableData) {
      if (rowData.Hsd !== null) {
        hsdSum += parseFloat(rowData.Hsd);
      }
    }
    return hsdSum;
  };

  // Function to calculate the sum of the 'E-Adv' column
  calculateEAdvSum = () => {
    const {tableData} = this.state;
    let eAdvSum = 0;
    for (const rowData of tableData) {
      if (rowData['E-Adv'] !== null) {
        eAdvSum += parseFloat(rowData['E-Adv']);
      }
    }
    return eAdvSum;
  };

  calculateSum = columnName => {
    const {tableData} = this.state;
    let sum = 0;
    for (const rowData of tableData) {
      const columnValue = rowData[columnName];
      if (!isNaN(columnValue) && parseFloat(columnValue) !== 0) {
        sum += parseFloat(columnValue);
      }
    }
    return !isNaN(sum) && sum !== 0 ? sum : ''; 
  };

  handlePrintPDF = async () => {
    console.log('Printing PDF...');
    console.log('tableHead:', this.state.tableHead);
    console.log('tableData:', this.state.tableData);
    // Check if both table header and data are available
    if (
      this.state.tableHead.length === 0 ||
      this.state.tableData.length === 0
    ) {
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
        ${this.state.tableData
          .map(
            (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row['TruckNo'] !== undefined ? row['TruckNo'] : ''}</td>
            <td>${row['Challan'] !== undefined ? row['Challan'] : ''}</td>
            <td>${row['TPNo'] !== undefined ? row['TPNo'] : ''}</td>
            <td>${
              row['TareWT'] !== undefined ? row['TareWT'].toFixed(3) : ''
            }</td>
            <td>${
              row['Unloading Qty'] !== undefined ? row['Unloading Qty'] : ''
            }</td>
            <td>${
              row['Unloading Date'] !== undefined
                ? moment(row['Unloading Date']).format('DD-MM-YYYY')
                : ''
            }</td>
            <td>${
              row['Cash'] !== undefined && parseFloat(row['Cash']) !== 0
                ? row['Cash'].toFixed(2)
                : ''
            }</td>
            <td>${
              row['E-Adv'] !== undefined && parseFloat(row['E-Adv']) !== 0
                ? row['E-Adv'].toFixed(2)
                : ''
            }</td>
            <td>${
              row['Hsd'] !== undefined && parseFloat(row['Hsd']) !== 0
                ? row['Hsd'].toFixed(2)
                : ''
            }</td>
            <td>${row['Memo No'] !== undefined ? row['Memo No'] : ''}</td>
            <td>${row['Pump Name'] !== undefined ? row['Pump Name'] : ''}</td>
            <td>${row['Remarks'] !== undefined ? row['Remarks'] : ''}</td>
          </tr>
        `,
          )
          .join('')}
        <tr>
          <td colspan="${this.state.tableHead.length}">Total</td>
          <td>${this.calculateSum('Loading Qty')}</td>
          <td>${this.calculateSum('Unloading Qty')}</td>
          <td>${this.calculateCashSum()}</td>
          <td>${this.calculateEAdvSum()}</td>
          <td>${this.calculateHsdSum()}</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
    `;

    const options = {
      html: htmlContent,
      fileName: 'Report',
      directory: 'Documents',
    };
    try {
      const pdf = await RNHTMLtoPDF.convert(options);
      console.log('PDF file creatwslnjndjkded at:', pdf.filePath);

      Alert.alert(
        'PDF Generated',
        'PDF has been generated successfully!',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  

  handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || this.state.selectedDate;
    this.setState({selectedDate: currentDate, showDatePicker: false}, () => {
      this.handleDateFilter();
    });
  };

  showDatePicker = () => {
    this.setState({showDatePicker: true});
  };

  

  render() {
    const {
      tableHead,
      tableData,
      currentPage,
      dataAvailable,
      showDatePicker,
      selectedDate,
    } = this.state;
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder="Branch Name"
          onChangeText={branchName => this.setState({branchName})}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder="Client Name"
          onChangeText={clientName => this.setState({clientName})}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder="Job Name"
          onChangeText={jobName => this.setState({jobName})}
        />
        <TouchableOpacity onPress={this.showDatePicker}>
          <Text style={styles.dateText}>
            Selected Date: {moment(selectedDate).format('DD/MM/YYYY')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={this.handleDateChange}
          />
        )}
        <Button title="Load Data" onPress={this.loadData} />
        <ScrollView horizontal={true}>
          <Table borderStyle={styles.tableBorder}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            {dataAvailable ? (
              tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={[
                    ++this.serialNumber,
                    rowData['TruckNo'] || '',
                    rowData['Challan'] || '',
                    rowData['TPNo'] || '',
                    rowData['Loading Qty'] || '',
                    rowData['Unloading Qty'] || '',
                    rowData['Unloading Date']
                      ? moment(rowData['Unloading Date']).format('DD-MM-YYYY')
                      : '',
                    rowData['Cash'] || '',
                    rowData['E-Adv'] || '',
                    rowData['Hsd'] || '',
                    rowData['Memo No'] || '',
                    rowData['Pump Name'] || '',
                    rowData['Remarks'] || '',
                  ]}
                  style={styles.row}
                  textStyle={styles.text}
                />
              ))
            ) : (
              <Text>No data available</Text>
            )}
          </Table>
        </ScrollView>
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={this.loadPreviousPage}
            disabled={currentPage <= 1}>
            <Text style={styles.paginationButton}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.paginationText}>Page {currentPage}</Text>
          <TouchableOpacity onPress={this.loadNextPage}>
            <Text style={styles.paginationButton}>Next</Text>
          </TouchableOpacity>
        </View>
        <Button title="Print PDF" onPress={this.handlePrintPDF} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    color: '#000',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#007BFF',
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#c8e1ff',
  },
  head: {
    height: 70,
    width: 900,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    color: '#000',
  },
  row: {
    height: 60,
    width: 900,
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paginationButton: {
    color: '#007BFF',
  },
  paginationText: {
    fontSize: 16,
  },

});



// The this keyword refers to the object that is executing the current 
// function or method. It allows access to object properties and methods
//  within the context of that object.