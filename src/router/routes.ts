import { createMemoryHistory, createRouter } from 'vue-router'

import RoomChat from '../components/RoomChat.vue'
import ConnectedUsers from '../components/ConnectedUser.vue'
import UserConnexion from '../components/UserConnexion.vue'
import ApplicationInfo from '../components/ApplicationInfo.vue'
import SessionClosed from '../components/SessionClosed.vue'
import VoteRoom from '../components/VoteRoom.vue'

const routes = [
  { path: '/', component: UserConnexion },
  { path: '/chat', component: RoomChat },
  { path: '/users', component: ConnectedUsers },
  { path: '/informations', component: ApplicationInfo },
  { path: '/closed', component: SessionClosed },
  { path: '/vote', component: VoteRoom },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router