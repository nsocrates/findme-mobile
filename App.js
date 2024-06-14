import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import * as Location from 'expo-location'
import locationService from './locationService'

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 15,
  },
  innerView: {
    paddingTop: 15,
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLead: {
    color: '#413f3e',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  errorView: {
    paddingTop: 22.5,
    width: '100%',
    paddingHorizontal: 15,
  },
  error: {
    color: '#c00',
    backgroundColor: '#fce4e4',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#fcc2c3',
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  btn: {
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#fff',
    paddingHorizontal: 45,
    paddingVertical: 20,
    borderRadius: 5,
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: '#84d0cf',
    color: '#fff',
  },
  btnSecondary: {
    backgroundColor: '#da4453',
    // backgroundColor: '#b4b4b5',
    color: '#fff',
  },
})

export default function App() {
  const [isGranted, setIsGranted] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [coords, setCoords] = useState([0, 0])
  const [error, setError] = useState(null)

  const handleStartTracking = () => {
    setIsTracking(true)
    return locationService.startLocationUpdatesAsync()
  }

  const handleStopTracking = () => {
    setIsTracking(false)
    return locationService.stopLocationUpdatesAsync()
  }

  const handlePayload = (payload, error) => {
    if (error) {
      setError(error.message)
      handleStopTracking()
    } else {
      setError(null)
      setCoords(payload)
    }
  }

  useEffect(() => {
    ;(async () => {
      const resf = await Location.requestForegroundPermissionsAsync()
      const resb = await Location.requestBackgroundPermissionsAsync()
      setIsGranted(resf.status === 'granted' && resb.status === 'granted')
    })()
  }, [])

  useEffect(() => {
    locationService.subscribe(handlePayload)

    return () => {
      locationService.unsubscribe(handlePayload)
      locationService.stopLocationUpdatesAsync()
    }
  }, [])

  const startTrackingMarkup = !isTracking && (
    <TouchableOpacity onPress={handleStartTracking}>
      <Text style={{ ...styles.btn, ...styles.btnPrimary }}>
        Start tracking
      </Text>
    </TouchableOpacity>
  )

  const stopTrackingMarkup = isTracking && (
    <TouchableOpacity onPress={handleStopTracking}>
      <Text style={{ ...styles.btn, ...styles.btnSecondary }}>
        Stop tracking
      </Text>
    </TouchableOpacity>
  )

  const errorMarkup = error && (
    <ScrollView style={styles.errorView}>
      <Text style={styles.error}>{error}</Text>
    </ScrollView>
  )

  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.innerView}>
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.textLead}>{coords[0]}° N</Text>
          <Text style={styles.textLead}>{coords[1]}° W</Text>
        </View>
        {startTrackingMarkup}
        {stopTrackingMarkup}
        {errorMarkup}
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  )
}
