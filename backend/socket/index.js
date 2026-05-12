const ConsultationRequest = require('../models/ConsultationRequest');
const Doctor = require('../models/Doctor');

module.exports = (io) => {
  // Store connected users: socket.id -> { userId, role, location }
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register user to socket
    socket.on('register', (data) => {
      const { userId, role, location } = data;
      connectedUsers.set(socket.id, { userId, role, location });
      if (role === 'doctor') {
        socket.join('doctors');
      }
      console.log(`${role} registered: ${userId}`);
    });

    // Patient raises a request
    socket.on('raise_request', async (data) => {
      // Broadcast to doctors matching criteria (simplified for now, broadcasts to all)
      io.to('doctors').emit('new_request', data);
      console.log('New request broadcasted');
    });

    // Doctor accepts request
    socket.on('accept_request', async (data) => {
      const { requestId, doctorId } = data;
      
      try {
        const reqDoc = await ConsultationRequest.findById(requestId);
        if (reqDoc && reqDoc.status === 'pending') {
          reqDoc.status = 'accepted';
          reqDoc.acceptedBy = doctorId;
          await reqDoc.save();

          // Notify the specific patient
          // Assuming we know patient's socket (we'd search connectedUsers)
          let patientSocketId = null;
          for (let [key, val] of connectedUsers.entries()) {
            if (val.userId === reqDoc.patient.toString()) {
              patientSocketId = key;
              break;
            }
          }

          if (patientSocketId) {
            io.to(patientSocketId).emit('request_accepted', {
              requestId,
              doctor: doctorId // ideally populated doctor details
            });
          }

          // Notify other doctors that request is taken
          io.to('doctors').emit('request_removed', { requestId });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
    });
  });
};
