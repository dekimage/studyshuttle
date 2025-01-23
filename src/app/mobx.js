import { action, makeAutoObservable, runInAction } from "mobx";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  updateDoc,
  getDocs,
  where,
} from "firebase/firestore";

class Store {
  // App Data
  analytics = {};
  upcomingEvents = [];
  academyGroups = [];
  nextAcademyGroups = [];
  professors = [];
  user = null;
  userReady = false;
  professors = [];

  // Static Data

  // App States
  isMobileOpen = false;
  loading = true;

  constructor() {
    makeAutoObservable({
      setUser: action, // Mark methods as actions
      setLoading: action,
      initializeAuth: action.bound, // Ensure actions are bound to the class instance
    });

    makeAutoObservable(this);
    this.initializeAuth();
    this.getIdToken = this.getIdToken.bind(this);
    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);

    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);
    this.logout = this.logout.bind(this);
    this.sendPasswordReset = this.sendPasswordReset.bind(this);

    // DONE NEXT SERVER
    this.joinGroup = this.joinGroup.bind(this);
    this.submitReview = this.submitReview.bind(this);

    this.createAcademyGroup = this.createAcademyGroup.bind(this);
    this.editAcademyGroup = this.editAcademyGroup.bind(this);
    this.deleteAcademyGroup = this.deleteAcademyGroup.bind(this);
    this.addScheduleEntry = this.addScheduleEntry.bind(this);
    this.deleteScheduleEntry = this.deleteScheduleEntry.bind(this);

    this.createEvent = this.createEvent.bind(this);
    //updateEvent in routes
    this.updateEventAndSubjectScores =
      this.updateEventAndSubjectScores.bind(this);
    this.sendSupportMessage = this.sendSupportMessage.bind(this);

    // TO DO

    this.handlePaymentCallback = this.handlePaymentCallback.bind(this);

    // FETCH NO SERVER
    this.fetchAcademyGroups = this.fetchAcademyGroups.bind(this);
    this.fetchProfessors = this.fetchProfessors.bind(this);
    this.fetchAcademyGroupsByProfessorId =
      this.fetchAcademyGroupsByProfessorId.bind(this);
    this.fetchAcademyGroupsForCurrentProfessor =
      this.fetchAcademyGroupsForCurrentProfessor.bind(this);
    this.fetchEventsForProfessor = this.fetchEventsForProfessor.bind(this);
    this.fetchUpcomingEventsForUser =
      this.fetchUpcomingEventsForUser.bind(this);
    this.fetchAcademyGroupsForUser = this.fetchAcademyGroupsForUser.bind(this);
    this.fetchUserGrades = this.fetchUserGrades.bind(this);
    this.fetchUserProfileWithGrades =
      this.fetchUserProfileWithGrades.bind(this);
    this.fetchUserProfileById = this.fetchUserProfileById.bind(this);
    this.fetchUserGradesById = this.fetchUserGradesById.bind(this);
    this.fetchAllProfessors = this.fetchAllProfessors.bind(this);
    this.checkUserReview = this.checkUserReview.bind(this);

    this.fetchAcademyGroupsByProfessor =
      this.fetchAcademyGroupsByProfessor.bind(this);
  }

  setUser(user) {
    this.user = user;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  async initializeAuth() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      runInAction(() => {
        this.setLoading(true);
      });

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          let userData = { uid: user.uid, ...userDoc.data() };

          if (userData.role === "professor") {
            const professorQuery = query(
              collection(db, "professors"),
              where("userId", "==", user.uid),
            );
            const professorSnapshot = await getDocs(professorQuery);

            if (!professorSnapshot.empty) {
              const professorData = professorSnapshot.docs[0].data();
              // Include the professor document ID as professorId
              userData = {
                ...userData,
                ...professorData,
                professorId: professorSnapshot.docs[0].id, // Add this line
              };
            }
          }

          runInAction(() => {
            this.setUser(userData);
            this.setLoading(false);
            this.userReady = true;
          });
        } else {
          runInAction(() => {
            this.setUser(null);
            this.setLoading(false);
            this.userReady = true;
          });
        }
      } else {
        runInAction(() => {
          this.setUser(null);
          this.setLoading(false);
          this.userReady = true;
        });
      }
    });
  }

  async sendSupportMessage(subject, message) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch("/api/sendSupportMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send support message");
      }

      return { success: true };
    } catch (error) {
      console.log("Error sending support message:", error);
      return { success: false, error: error.message };
    }
  }

  async joinGroup(groupId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch("/api/joinGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join group");
      }

      // Handle success

      console.log("Successfully joined group");
      return { success: true };
    } catch (error) {
      console.log("Error:", error.message);
      return { error };
    }
  }

  async handlePaymentCallback(paymentDetails) {
    const { paymentId, status, packagePurchased, tokensPurchased, couponUsed } =
      paymentDetails;

    if (!this.user) {
      console.log("No user logged in.");
      return { error: "No user logged in" };
    }

    const newOrder = {
      userId: this.user.uid,
      date: new Date(),
      paymentId,
      status,
      packagePurchased,
      tokensPurchased,
      couponUsed: couponUsed || null, // Only add coupon if it was used
    };

    try {
      // Create the order in Firestore
      const orderDocRef = await addDoc(collection(db, "orders"), newOrder);

      // Determine which token type to increase
      let updatedTokens = {};

      switch (packagePurchased) {
        case "blueTokenPackage":
          updatedTokens.blueTokens =
            (this.user.blueTokens || 0) + tokensPurchased;
          break;
        case "yellowTokenPackage":
          updatedTokens.yellowTokens =
            (this.user.yellowTokens || 0) + tokensPurchased;
          break;
        // Add cases for other token types if needed
        default:
          console.log("Unknown package purchased.");
          return { error: "Unknown package purchased" };
      }

      // Update the user's token count in Firestore
      await updateDoc(doc(db, "users", this.user.uid), updatedTokens);

      // Update the user's token count in MobX store
      runInAction(() => {
        this.user = { ...this.user, ...updatedTokens };
      });

      return { success: true, orderId: orderDocRef.id };
    } catch (error) {
      console.log("Error creating order or updating tokens:", error);
      return { error: "Error creating order or updating tokens" };
    }
  }

  async fetchAcademyGroupsByProfessor(professorId) {
    try {
      const q = query(
        collection(db, "academyGroups"),
        where("professorId", "==", professorId),
      );

      const querySnapshot = await getDocs(q);
      const academyGroups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: academyGroups }; // Return data directly
    } catch (error) {
      console.log("Error fetching academy groups:", error);
      return { success: false, error: "Error fetching academy groups" };
    }
  }

  async fetchAllProfessors() {
    try {
      const professorsCollection = collection(db, "professors"); // Replace "professors" with your Firestore collection name
      const professorsSnapshot = await getDocs(professorsCollection);
      const fetchedProfessors = professorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      runInAction(() => {
        this.professors = fetchedProfessors; // Store fetched professors in MobX store
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching professors:", error);
      return { error: "Error fetching professors" };
    }
  }

  // New function to fetch user profile by ID
  async fetchUserProfileById(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
      return { error: "Error fetching user profile" };
    }
  }

  // New function to fetch a specific user's grades by user ID
  async fetchUserGradesById(userId) {
    try {
      const gradesRef = collection(db, "users", userId, "subjects");
      const gradesSnapshot = await getDocs(gradesRef);

      const grades = {};
      gradesSnapshot.forEach((doc) => {
        grades[doc.id] = doc.data();
      });

      return { success: true, data: grades };
    } catch (error) {
      console.log("Error fetching user grades:", error);
      return { error: "Error fetching user grades" };
    }
  }

  async fetchUserProfileWithGrades(userId) {
    try {
      const profileResult = await this.fetchUserProfileById(userId);
      if (!profileResult.success) {
        return { success: false, error: profileResult.error };
      }

      const gradesResult = await this.fetchUserGradesById(userId);
      if (!gradesResult.success) {
        return { success: false, error: gradesResult.error };
      }

      return {
        success: true,
        data: {
          userProfile: profileResult.data,
          userGrades: gradesResult.data,
        },
      };
    } catch (error) {
      console.log("Error fetching user profile with grades:", error);
      return { error: "Error fetching user profile with grades" };
    }
  }

  async fetchUserGrades() {
    if (!this.user) {
      console.log("User not loaded yet");
      return { success: false, error: "User not loaded yet" };
    }

    if (this.user.role === "sadasd") {
      return {
        success: false,
        error: "User is a professor, no grades to fetch",
      };
    }

    try {
      const gradesRef = collection(db, `users/${this.user.uid}/subjects`);
      const gradesSnapshot = await getDocs(gradesRef);

      const grades = {};

      gradesSnapshot.forEach((doc) => {
        grades[doc.id] = doc.data();
      });

      runInAction(() => {
        this.analytics = grades;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching user grades:", error);
      return { success: false, error: "Error fetching user grades" };
    }
  }
  async fetchUpcomingEventsForUser(forceFetch = false) {
    try {
      if (!this.user) throw new Error("User not logged in");

      // Check if the data already exists and don't refetch unless forced
      if (!forceFetch && this.upcomingEvents.length > 0) {
        return { success: true };
      }

      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      let eventsQuery;

      // Modify the query based on the user's role
      if (this.user.role === "professor") {
        // Fetch events where professorId matches the professor's ID
        eventsQuery = query(
          collection(db, "events"),
          where("professorId", "==", this.user.professorId), // Correct field for professor
        );
      } else {
        // Fetch events where userId matches the student's ID
        eventsQuery = query(
          collection(db, "events"),
          where("userId", "==", this.user.uid), // Correct field for student
        );
      }
      const eventsSnapshot = await getDocs(eventsQuery);

      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if the user is a professor
      let nameDetails = {};
      let link = "";

      if (this.user.role === "professor") {
        // Extract unique user IDs
        const uniqueUserIds = [...new Set(events.map((event) => event.userId))];

        // Fetch user details for each unique user ID
        for (const userId of uniqueUserIds) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            nameDetails[userId] = `${userDoc.data().name} ${userDoc.data().lastname
              }`;
          } else {
            nameDetails[userId] = "Unknown User";
          }
        }

        // Map user names back to events
        events.forEach((event) => {
          event.participantName = nameDetails[event.userId];
        });
      } else {
        // Extract unique professor IDs
        const uniqueProfessorIds = [
          ...new Set(events.map((event) => event.professorId)),
        ];

        // Fetch professor details for each unique professor ID
        for (const professorId of uniqueProfessorIds) {
          const professorDoc = await getDoc(doc(db, "professors", professorId));
          if (professorDoc.exists()) {
            nameDetails[professorId] = `${professorDoc.data().name} ${professorDoc.data().lastname
              }`;
            link = professorDoc.data().link;
          } else {
            nameDetails[professorId] = "Unknown Professor";
          }
        }

        // Map professor names back to events
        events.forEach((event) => {
          event.professorName = nameDetails[event.professorId];
          event.link = link;
        });
      }

      runInAction(() => {
        this.upcomingEvents = events;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching upcoming events:", error);
      return { error: "Error fetching upcoming events" };
    }
  }
  async fetchAcademyGroupsForUser() {
    try {
      if (!this.user) {
        console.log("No user logged in");
        throw new Error("User not logged in");
      }

      console.log("Fetching groups for user:", this.user.uid);
      console.log("User role:", this.user.role);

      let groupsQuery;

      if (this.user.role === "professor") {
        console.log("Querying as professor with ID:", this.user.professorId);
        groupsQuery = query(
          collection(db, "academyGroups"),
          where("professorId", "==", this.user.professorId),
        );
      } else {
        console.log("Querying as student with ID:", this.user.uid);
        groupsQuery = query(
          collection(db, "academyGroups"),
          where("users", "array-contains", this.user.uid),
        );
      }

      const groupsSnapshot = await getDocs(groupsQuery);
      console.log("Query returned:", groupsSnapshot.size, "documents");

      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Processed groups:", groups);

      runInAction(() => {
        this.academyGroups = groups;
        console.log(
          "Updated MobX store with groups:",
          this.academyGroups.length,
        );
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching academy groups:", error);
      return { error: error.message };
    }
  }

  async fetchAcademyGroups() {
    if (!this.user) return;

    try {
      const q = query(
        collection(db, "academyGroups"),
        where("users", "array-contains", this.user.uid),
      );
      const querySnapshot = await getDocs(q);
      const academyGroups = [];

      querySnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.academyGroups = academyGroups;
      });
    } catch (error) {
      console.log("Error fetching academy groups:", error);
    }
  }

  async fetchProfessors() {
    try {
      const querySnapshot = await getDocs(collection(db, "professors"));
      const professors = [];

      querySnapshot.forEach((doc) => {
        professors.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.professors = professors;
      });
    } catch (error) {
      console.log("Error fetching professors:", error);
    }
  }

  async fetchAcademyGroupsByProfessorId(professorId) {
    try {
      const q = query(
        collection(db, "academyGroups"),
        where("professor", "==", professorId),
      );
      const querySnapshot = await getDocs(q);
      const academyGroups = [];

      querySnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.academyGroups = academyGroups;
      });
    } catch (error) {
      console.log("Error fetching academy groups by professor ID:", error);
    }
  }

  async checkUserReview(professorId) {
    try {
      const reviewQuery = query(
        collection(db, "reviews"),
        where("professorId", "==", professorId),
        where("userId", "==", this.user.uid),
      );

      const reviewSnapshot = await getDocs(reviewQuery);

      if (!reviewSnapshot.empty) {
        const reviewDoc = reviewSnapshot.docs[0]; // Fetch the first matching review
        return {
          success: true,
          reviewed: true,
          review: { id: reviewDoc.id, ...reviewDoc.data() },
        }; // Corrected structure to match the usage
      } else {
        return { success: true, reviewed: false, review: null };
      }
    } catch (error) {
      console.log("Error fetching review:", error);
      return { success: false, error: "Error fetching review" };
    }
  }

  async getIdToken() {
    if (!this.user) {
      console.log("No user is logged in");
      return null;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.log("Error getting ID token:", error);
      return null;
    }
  }

  async submitReview(
    professorId,
    stars,
    existingReviewStars = null,
    reviewId = null,
  ) {
    try {
      if (!this.user) {
        console.log("No user logged in.");
        return { error: "No user logged in" };
      }

      const token = await this.getIdToken();

      const response = await fetch("/api/submitReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professorId,
          stars,
          existingReviewStars,
          reviewId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      return { success: true, updated: data.updated };
    } catch (error) {
      console.log("Error submitting review:", error.message);
      return { error: error.message };
    }
  }

  async createAcademyGroup(name, subject, studentType, schedule) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/academyGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, subject, studentType, schedule }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create academy group");
      }

      // Handle success
      return { success: true };
    } catch (error) {
      console.log("Error creating academy group:", error);
      return { error: error.message };
    }
  }

  async editAcademyGroup(academyGroupId, updatedData) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/academyGroup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ academyGroupId, updatedData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to edit academy group");
      }

      // Handle success
      runInAction(() => {
        const index = this.academyGroups.findIndex(
          (group) => group.id === academyGroupId,
        );
        if (index !== -1) {
          this.academyGroups[index] = {
            ...this.academyGroups[index],
            ...updatedData,
          };
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error editing academy group:", error);
      return { error: error.message };
    }
  }

  async deleteAcademyGroup(academyGroupId) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/academyGroup", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ academyGroupId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete academy group");
      }

      // Handle success
      runInAction(() => {
        this.academyGroups = this.academyGroups.filter(
          (group) => group.id !== academyGroupId,
        );
      });

      return { success: true };
    } catch (error) {
      console.log("Error deleting academy group:", error);
      return { error: error.message };
    }
  }

  async fetchAcademyGroupsForCurrentProfessor() {
    if (!this.user || this.user.role !== "professor") {
      console.log(
        "Access denied: Only professors can view their academy groups.",
      );
      return { error: "Access denied" };
    }

    try {
      // Step 1: Fetch the professor's details using their user ID
      const professorQuery = query(
        collection(db, "professors"),
        where("userId", "==", this.user.uid),
      );
      const professorSnapshot = await getDocs(professorQuery);

      if (professorSnapshot.empty) {
        console.log("Professor not found.");
        return { error: "Professor not found" };
      }

      const professorDoc = professorSnapshot.docs[0];
      const professorId = professorDoc.id;

      // Step 2: Fetch all academy groups for the professor
      const academyGroupsQuery = query(
        collection(db, "academyGroups"),
        where("professorId", "==", professorId),
      );

      const academyGroupsSnapshot = await getDocs(academyGroupsQuery);
      const academyGroups = [];

      academyGroupsSnapshot.forEach((doc) => {
        academyGroups.push({ id: doc.id, ...doc.data() });
      });

      // Step 3: Extract unique user IDs from all academy groups
      const uniqueUserIds = new Set();
      academyGroups.forEach((group) => {
        if (group.users) {
          group.users.forEach((userId) => uniqueUserIds.add(userId));
        }
      });

      // Step 4: Fetch user details for each unique user ID
      const nameDetails = {};
      for (const userId of uniqueUserIds) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          nameDetails[userId] = `${userDoc.data().name} ${userDoc.data().lastname
            }`;
        } else {
          nameDetails[userId] = "Unknown User";
        }
      }

      // Step 5: Map user names back to each academy group
      academyGroups.forEach((group) => {
        if (group.users) {
          group.participantNames = group.users.map(
            (userId) => nameDetails[userId] || "Unknown User",
          );
        }
      });

      // Step 6: Update the state with the fetched academy groups
      runInAction(() => {
        this.academyGroups = academyGroups;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching academy groups:", error);
      return { error: "Error fetching academy groups" };
    }
  }

  // EVENTS
  async createEvent({
    date,
    timeRange,
    userId,
    professorId,
    subject,
    classType,
    notes,
  }) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          timeRange,
          userId,
          professorId,
          subject,
          classType,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      // Handle success
      runInAction(() => {
        // Update local state, e.g., tokens or events
        this.user.yellowTokens -= 1;
        console.log("Event created successfully");
      });

      return { success: true };
    } catch (error) {
      console.log("Error creating event:", error);
      return { error: error.message };
    }
  }

  // PROFESOR TERMINI PRAVI

  async addScheduleEntry(date, timeRanges) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, timeRanges }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add schedule entry");
      }

      // Handle success
      runInAction(() => {
        // Update local state if necessary
        if (!this.user.schedule) this.user.schedule = [];
        const dateString = new Date(date).toISOString().split("T")[0];

        const existingEntryIndex = this.user.schedule.findIndex(
          (entry) => entry.date === dateString,
        );

        if (existingEntryIndex > -1) {
          this.user.schedule[existingEntryIndex].timeRanges.push(...timeRanges);
        } else {
          this.user.schedule.push({ date: dateString, timeRanges });
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error adding schedule entry:", error);
      return { error: error.message };
    }
  }

  async deleteScheduleEntry(date, timeRangeToDelete) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/schedule", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, timeRangeToDelete }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete time range");
      }

      // Handle success
      runInAction(() => {
        const existingEntryIndex = this.user.schedule.findIndex(
          (entry) => entry.date === date,
        );

        if (existingEntryIndex > -1) {
          this.user.schedule[existingEntryIndex].timeRanges =
            this.user.schedule[existingEntryIndex].timeRanges.filter(
              (range) =>
                range.from !== timeRangeToDelete.from ||
                range.to !== timeRangeToDelete.to,
            );

          // If no time ranges are left, remove the entire date entry
          if (this.user.schedule[existingEntryIndex].timeRanges.length === 0) {
            this.user.schedule.splice(existingEntryIndex, 1);
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error deleting time range:", error);
      return { error: error.message };
    }
  }

  // EVENTS
  async fetchEventsForProfessor(professorId) {
    try {
      // Step 1: Fetch events for the professor
      const eventsQuery = query(
        collection(db, "events"),
        where("professorId", "==", professorId),
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsList = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Step 2: Fetch user information for each event based on userId
      const eventsWithUserData = await Promise.all(
        eventsList.map(async (event) => {
          if (event.userId) {
            // Get the user document by userId
            const userRef = doc(db, "users", event.userId);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              // Combine event data with user data
              return {
                ...event,
                user: {
                  name: userData.name,
                  email: userData.email,
                  lastname: userData.lastname,
                },
              };
            }
          }
          // If no user data is found, return event as is
          return { ...event, user: null };
        }),
      );

      // Step 3: Store the events with user data in MobX store
      runInAction(() => {
        this.events = eventsWithUserData;
      });

      return { success: true };
    } catch (error) {
      console.log("Error fetching events:", error);
      return { error: "Error fetching events" };
    }
  }

  async updateEventAndSubjectScores(event) {
    try {
      const token = await this.getIdToken(); // Use the method to get the user's ID token

      const response = await fetch("/api/updateEvent", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update event and subject scores",
        );
      }

      // Handle success and update the MobX state
      runInAction(() => {
        const eventIndex = this.events.findIndex((e) => e.id === event.id);
        if (eventIndex !== -1) {
          this.events[eventIndex] = event;
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error updating event and subject scores:", error);
      return { error: error.message };
    }
  }

  // AUTH
  async loginWithEmail({ email, password }) {
    try {
      this.loading = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Set user in MobX store if verified
      runInAction(() => {
        this.user = user;
        this.loading = false;
      });
    } catch (error) {
      console.log("Error logging in:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async signupWithEmail(email, password, name, lastname, academicLevel, phone) {
    try {
      this.loading = true;

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          lastname,
          academicLevel,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Optionally update local state
      runInAction(() => {
        this.user = { email, name, lastname, academicLevel, phone };
        this.loading = false;
      });

      return { success: true };
    } catch (error) {
      console.log("Error signing up:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth); // Sign out from Firebase Authentication
      runInAction(() => {
        this.user = null; // Reset the user in the store
      });
    } catch (error) {
      console.log("Error during logout:", error);
      // Handle any errors that occur during logout
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      // Handle success, such as showing a message to the user
    } catch (error) {
      console.log("Error sending password reset email:", error);
      // Handle errors, such as invalid email, etc.
    }
  }

  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
    });
  }
}

const MobxStore = new Store();
export default MobxStore;
