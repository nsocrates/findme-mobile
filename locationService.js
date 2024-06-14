import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const TASK = 'BROADCAST_LOCATION'
const WS_URL = process.env.EXPO_PUBLIC_WS_URL

const noop = () => {}

const locationService = (function () {
  const subs = []
  const state = { coords: [] }
  const socket = new WebSocket(WS_URL)

  const subscribe = sub => {
    subs.push(sub)
  }

  const unsubscribe = sub => {
    subs.splice(subs.indexOf(sub), 1)
  }

  const publish = () => {
    subs.forEach(sub => sub(state.coords))
  }

  const handleLocationTask = payload => {
    const { data, error } = payload

    if (error) {
      console.log(error)
      return
    }

    if (!data) {
      return
    }

    const {
      coords: { latitude, longitude },
    } = data.locations[0]
    const [lat, lng] = state.coords

    if (latitude !== lat || longitude !== lng) {
      const action = 'broadcast'
      const message = [latitude, longitude]
      state.coords = message
      socket.send(JSON.stringify({ action, message }))
      publish()
    }
  }

  const startLocationUpdatesAsync = () => {
    return Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.HighestAccuracy,
      activityType: Location.ActivityType.Fitness,
      pausesUpdatesAutomatically: true,
      showsBackgroundLocationIndicator: true,
      foregroundService: { killServiceOnDestroy: true },
    }).catch(noop)
  }

  const stopLocationUpdatesAsync = () => {
    return Location.stopLocationUpdatesAsync(TASK).catch(noop)
  }

  socket.addEventListener('open', () => {
    TaskManager.defineTask(TASK, handleLocationTask)
    return true
  })

  socket.addEventListener('error', e => {
    subs.forEach(sub => sub(null, e))
  })

  return {
    subscribe,
    unsubscribe,
    startLocationUpdatesAsync,
    stopLocationUpdatesAsync,
  }
})()

export default locationService
