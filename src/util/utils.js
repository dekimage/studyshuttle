export function mixInitials(user) {
  if (!user) {
    return "";
  }
  const { name, lastname } = user;
  if (!name || !lastname) {
    return "";
  }
  if (name.length > 0 && lastname.length > 0) {
    return (name.charAt(0) + lastname.charAt(0)).toUpperCase();
  } else {
    return "";
  }
}
