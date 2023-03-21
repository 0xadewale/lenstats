import Profile from "./Profile";

type FollowerProfile = {
  totalAmountOfTimesFollowed: number;
  wallet: {
    address: string;
    defaultProfile: Profile
  }
};

export default FollowerProfile;
