const User = ({ username }: { username: string }) => {
  return (
    <div className="flex items-center gap-4 text-xs py-1 px-4">
      <div className="bg-pink-600 text-white w-[30px] h-[30px] rounded-md flex items-center justify-center">
        <p>{username.slice(0, 2).toUpperCase()}</p>
      </div>
      <p className="text-neutral-300 capitalize">{username}</p>
    </div>
  );
};

export default User;
