export const getHealth = (request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
      service: "oee-production-monitor-api",
      timestamp: new Date().toISOString(),
    },
  });
};