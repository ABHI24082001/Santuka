import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class OfflineReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ['Sl No', 'Tp', 'Challan', 'Cash', 'Hsd', 'Upi','UpiId' ,'TruckNo', 'UPIAmt', 'SlipNo', 'CreatedBy', 'CapturedPhoto'],
      widthArr: [50, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,100, ],
      tableData: [],
    };
    this.serialNumber = 0;
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('offlineData');
      if (offlineData) {
        const parsedData = JSON.parse(offlineData);
        // Assign serial numbers to each row
        parsedData.forEach((rowData) => {
          this.serialNumber += 1;
          rowData['Sl No'] = this.serialNumber;
        });
        this.setState({ tableData: parsedData });
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  render() {
    const state = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText1}>SANTUKA TRANSPORT</Text>
          <Text style={styles.headerText2}>NIE, JAGATPUR, CUTTACK</Text>
        </View>
        <ScrollView horizontal={true}>
          <View>
            <Table borderStyle={{}}>
              <Row data={state.tableHead} widthArr={state.widthArr} style={styles.header} textStyle={styles.text} />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              {state.tableData.length > 0 ? (
                state.tableData.map((rowData, index) => (
                  <Table borderStyle={{}} key={index}>
                    <Row
                      data={state.tableHead.map(header => {
                        // Handle undefined or null values
                        const value = rowData[header];
                        return value !== undefined && value !== null ? value.toString() : 'NA';
                      })}
                      widthArr={state.widthArr}
                      style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]
                      }
                      textStyle={styles.text}
                    />
                  </Table>
                ))
              ) : (
                <Text style={styles.noDataText}>No offline data available.</Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText1: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'black',
  },
  headerText2: {
    fontSize: 16,
    color:'black',
  },
  header: { height: 50, backgroundColor: '#537791' },
  text: { textAlign: 'center', fontWeight: 'bold', color: 'black' },
  dataWrapper: { marginTop: -1 },
  row: { height: 150, backgroundColor: '#E7E6E1' },
  noDataText: { textAlign: 'center', color: 'red', marginTop: 10 },
});
