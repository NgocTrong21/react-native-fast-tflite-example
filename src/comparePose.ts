interface Tuple {
  x: number;
  y: number;
}

interface Coordinate {
  label: string;
  score: number;
  x: number;
  y: number;
}

function convertPoseDataToCoordinates(
  poseData: Coordinate[]
): [number, number][] {
  if (poseData) {
    return poseData.map((point) => [point.x, point.y]);
  } else {
    return [];
  }
}

const pose1Coordinates: [number, number][] =
  convertPoseDataToCoordinates(posesData); //Dữ liệu của người dùng
const pose2Coordinates: [number, number][] =
  convertPoseDataToCoordinates(posesData); //Dữ liệu để tham chiếu

const maxPose1X = Math.max(...pose1Coordinates.map(([x, y]) => x));
const maxPose1Y = Math.max(...pose1Coordinates.map(([x, y]) => y));
const maxPose2X = Math.max(...pose2Coordinates.map(([x, y]) => x));
const maxPose2Y = Math.max(...pose2Coordinates.map(([x, y]) => y));

const normalizedPose1 = pose1Coordinates.map(([x, y]) => ({
  x: x / maxPose1X,
  y: y / maxPose1Y,
}));
const normalizedPose2 = pose2Coordinates.map(([x, y]) => ({
  x: x / maxPose2X,
  y: y / maxPose2Y,
}));

let p1 = [];
let p2 = [];

for (let joint = 0; joint < pose1Coordinates.length; joint++) {
  const x1 = normalizedPose1[joint].x;
  const y1 = normalizedPose1[joint].y;
  const x2 = normalizedPose2[joint].x;
  const y2 = normalizedPose2[joint].y;

  p1.push(x1, y1);
  p2.push(x2, y2);
}

const dotProduct = (pose1, pose2) => {
  let sum = 0;
  for (let i = 0; i < pose1.length; i++) {
    sum += pose1[i] * pose2[i];
  }
  return sum;
};

const norm = (poseNorm) => {
  let sumOfSquares = 0;
  for (let i = 0; i < poseNorm.length; i++) {
    sumOfSquares += poseNorm[i] * poseNorm[i];
  }
  return Math.sqrt(sumOfSquares);
};

const cosine_distance = (poseCor1, poseCor2) => {
  const dotProd = dotProduct(poseCor1, poseCor2);

  const lengthPose1 = norm(poseCor1);
  const lengthPose2 = norm(poseCor2);

  const cossim = dotProd / (lengthPose1 * lengthPose2);

  const cosdist = 1 - cossim;

  return cosdist;
};

const scoreA = cosine_distance(p1, p2);
