import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const TASK = 'BROADCAST_LOCATION'
const WS_URL = process.env.EXPO_PUBLIC_WS_URL

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
      console.error(error)
      return
    }

    const location = data?.locations[0]

    if (!location) {
      return
    }

    const {
      coords: { latitude, longitude },
    } = location
    const [lat, lng] = state.coords
    const nextLat = parseFloat(latitude.toFixed(5))
    const nextLng = parseFloat(longitude.toFixed(5))

    if (nextLat !== lat || nextLng !== lng) {
      const action = 'broadcast'
      const message = [nextLat, nextLng]
      const broadcast = JSON.stringify({ action, message })
      console.log(broadcast)
      state.coords = message
      socket.send(broadcast)
      publish()
    }
  }

  const startLocationUpdatesAsync = () => {
    console.log('startLocationUpdatesAsync')
    return Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.HighestAccuracy,
      activityType: Location.ActivityType.Fitness,
      pausesUpdatesAutomatically: true,
      showsBackgroundLocationIndicator: true,
      foregroundService: { killServiceOnDestroy: true },
    }).catch(console.error)
  }

  const stopLocationUpdatesAsync = () => {
    console.log('stopLocationUpdatesAsync')
    return Location.stopLocationUpdatesAsync(TASK).catch(console.error)
  }

  socket.addEventListener('open', () => {
    if (!TaskManager.isTaskDefined(TASK)) {
      TaskManager.defineTask(TASK, handleLocationTask)
    }

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
