// "use client";

// import EditProfile from "../_components/edit-profile";

// import { useState, useEffect, useMemo } from "react";
// import { supabaseClient } from "../../util/supabaseClient";
// import { redirect } from "next/navigation";
// import { useAuth, useUser } from "@clerk/nextjs";
// import Link from "next/link";
// import { getSupabaseTables, dbAssignRole } from "../../util/requests";
// import Image from "next/image";
// import { Title } from "../_components/ReusableDivs";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { ChevronLeft } from "lucide-react";
// import { PricingBox } from "../pricing/PricingBox";
// import { freeData } from "../pricing/page";

// export default function Home() {
//   //const hello = await api.post.hello.query({ text: "from tRPC" });

//   const { getToken } = useAuth();
//   const {
//     user: loggedInUser,
//     isSignedIn: userIsSignedIn,
//     isLoaded: userIsLoaded,
//   } = useUser();

//   const [supabaseConnection, setSupabaseConnection] = useState(null);
//   const [supabaseStillLoading, setSupabaseStillLoading] = useState(true);
//   const [educationLevels, setEducationLevels] = useState([]);
//   const [userRoles, setUserRoles] = useState([]);
//   const [services, setServices] = useState([]);
//   const [providers, setProviders] = useState([]);

//   const userRole =
//     userRoles?.filter((role) => role?.users?.length > 0)?.role || "student";

//   // Group services by CategoryId and providers by ServiceId
//   const groupedServices = useMemo(() => {
//     if (
//       educationLevels.length === 0 ||
//       services.length === 0 ||
//       providers.length === 0
//     )
//       return [];
//     // Step 1: Create a map of services by category
//     const servicesByCategory = services.reduce((acc, svc) => {
//       if (!acc[svc.categoryId]) {
//         acc[svc.categoryId] = [];
//       }
//       acc[svc.categoryId].push({ ...svc, providers: [] });
//       return acc;
//     }, {});

//     // Step 2: Assign providers to the corresponding service
//     providers.forEach((prov) => {
//       prov.services.forEach((serviceId) => {
//         // Finding the service object in servicesByCategory
//         Object.values(servicesByCategory).forEach((categoryServices) => {
//           const serviceObj = categoryServices.find(
//             (svc) => svc.id == serviceId,
//           );
//           if (serviceObj) {
//             // This condition checks if the provider is not already added
//             if (!serviceObj.providers.some((p) => p.id === prov.id)) {
//               serviceObj.providers.push(prov);
//             }
//           }
//         });
//       });
//     });

//     // Step 3: Map categories to their services
//     let groupedServices = educationLevels.map((el) => ({
//       ...el,
//       services: servicesByCategory[el.ea_id] || [],
//     }));
//     return groupedServices;
//   }, [educationLevels, services, providers]);
//   // Get the classes for the user's education level
//   const userEducationClasses = groupedServices?.filter(
//     (el) => el?.users?.length > 0,
//   )[0];

//   // on first load, fetch supabase data
//   useEffect(() => {
//     if (userIsSignedIn === false || userIsLoaded === false) return;
//     const onLoad = async () => {
//       try {
//         const supabaseAccessToken = await getToken({
//           template: "supabase",
//         });
//         if (!supabaseAccessToken) {
//           redirect("/sign-in");
//         }
//         const supabase = await supabaseClient(supabaseAccessToken);
//         setSupabaseConnection(supabase);

//         const {
//           educationLevels,
//           userRoles,
//           educationLevelsError,
//           userRolesError,
//         } = await getSupabaseTables(supabase);
//         setEducationLevels(educationLevels);
//         setUserRoles(userRoles);
//         // Find Logged-in user's role and education level

//         let userRole = userRoles?.filter((role) => role?.users?.length > 0);
//         if (userRole?.length === 0) {
//           // User doesn't have a role, set one
//           let studentRole = userRoles?.find((role) => role.role === "student");
//           if (studentRole) {
//             await dbAssignRole(supabase, loggedInUser.id, studentRole.id);
//             userRole = studentRole;
//           } else {
//             console.error("Student role doesn't exist");
//           }
//         }
//       } catch (e) {
//         alert(e);
//       } finally {
//         setSupabaseStillLoading(false);
//       }
//     };
//     onLoad();
//   }, [userIsLoaded]);

//   useEffect(() => {
//     fetchEasyAppointments();
//   }, []);

//   const fetchEasyAppointments = async () => {
//     const bearer = "Bearer Recliner0~Stinky~Decorated~Crook~Hydrant";
//     const fetchOptions = {
//       headers: {
//         Authorization: bearer,
//         accept: "application/json",
//       },
//     };

//     fetch(
//       "https://scheduler.studyshuttle.mk/index.php/api/v1/services",
//       fetchOptions,
//     )
//       .then((servicesResponse) => {
//         if (servicesResponse.ok) {
//           return servicesResponse.json();
//         }
//         throw new Error("Something went wrong");
//       })
//       .then((services) => {
//         setServices(services);
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     fetch(
//       "https://scheduler.studyshuttle.mk/index.php/api/v1/providers",
//       fetchOptions,
//     )
//       .then((providersResponse) => {
//         if (providersResponse.ok) {
//           return providersResponse.json();
//         }
//         throw new Error("Something went wrong");
//       })
//       .then((providers) => {
//         setProviders(providers);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   console.log(userEducationClasses?.services[0]?.providers);

//   const SessionCard = ({ event, isSelected, onSelect }) => {
//     return (
//       <div
//         className={`flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow-md ${
//           isSelected ? "border-2 border-black" : `border-2 border-none`
//         }`}
//         onClick={onSelect}
//       >
//         <div className="flex flex-col">
//           <div className="text-sm font-semibold text-gray-500">{event.day}</div>
//           <div className="text-lg font-semibold text-gray-800">
//             {event.start}
//           </div>
//         </div>
//         <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
//           <svg
//             className="h-6 w-6 text-gray-500"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path d="M5 13l4 4L19 7"></path>
//           </svg>
//         </div>
//       </div>
//     );
//   };

//   // DUMMY DATA
//   const events = [
//     {
//       id: 1,
//       start: "8:00",
//       day: "Monday",
//     },
//     {
//       id: 2,
//       start: "10:00",
//       day: "Tuesday",
//     },
//     { id: 3, start: "12:00", day: "Wednesday" },
//   ];

//   const ProfessorEventsDialog = () => {
//     const userTokens = 0;
//     const [selectedSessionCard, setSelectedSessionCard] = useState(null);
//     const [step, setStep] = useState(1);
//     const stepInfo = [
//       {
//         title: "Изберете термин",
//         description: "Одберете термин за час со професорот. 1 час = 1 токен",
//       },
//       {
//         title: "Наплата со Токени",
//         description: "Цена: 1 токен.",
//       },
//     ];

//     useEffect(() => {
//       return () => {
//         setSelectedSessionCard(null);
//         setStep(1);
//       };
//     }, []);

//     return (
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button>Закажи Час</Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             {step > 1 && (
//               <Button
//                 variant="outline"
//                 className="mb-2 w-fit gap-1"
//                 onClick={() => setStep(1)}
//               >
//                 <ChevronLeft size={20} /> Назад
//               </Button>
//             )}

//             <DialogTitle> {stepInfo[step - 1].title}</DialogTitle>
//             <DialogDescription>
//               {stepInfo[step - 1].description}
//             </DialogDescription>
//           </DialogHeader>

//           {step === 1 && (
//             <div className="overflow-y flex flex-col gap-4">
//               {events.map((event, i) => (
//                 <SessionCard
//                   key={i}
//                   event={event}
//                   isSelected={selectedSessionCard?.id === event.id}
//                   onSelect={() => setSelectedSessionCard(event)}
//                 />
//               ))}
//             </div>
//           )}

//           {step === 2 &&
//             (userTokens > 0 ? (
//               <div className="text-green-500">
//                 Достапни Токени: {userTokens}
//               </div>
//             ) : (
//               <div>
//                 <div className="mb-4 text-red-500">
//                   Достапни Токени: {userTokens}
//                 </div>
//                 <PricingBox data={freeData} isAuthenticated={false} />
//               </div>
//             ))}

//           <DialogFooter>
//             {step === 1 && (
//               <Button
//                 disabled={!selectedSessionCard}
//                 onClick={() => setStep(2)}
//               >
//                 Продолжи кон наплата
//               </Button>
//             )}
//             {step === 2 && (
//               <Button disabled={userTokens < 1} onClick={() => setStep(2)}>
//                 Купи Час
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   const Courses = () => {
//     return (
//       <div className="container mx-auto p-4">
//         <Title>Професори</Title>
//         <div className="flex w-full flex-col">
//           {userEducationClasses.services.map(
//             (service) =>
//               service.providers.length > 0 && (
//                 <div key={service.id} className="mb-6">
//                   <h2 className="mb-3 text-xl font-semibold">{service.name}</h2>
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//                     {service.providers.map((provider) => (
//                       <Card
//                         key={provider.id}
//                         className="card bg-neutral w-64 rounded-lg p-4 shadow-xl"
//                       >
//                         <figure>
//                           <Image
//                             className=" rounded-xl object-cover"
//                             src={provider.address}
//                             alt="Profile picture"
//                             width={100}
//                             height={100}
//                           />
//                         </figure>
//                         <div className="card-title my-4 justify-center text-2xl">
//                           {provider.firstName} {provider.lastName}
//                         </div>
//                         <div className="-sm mb-6 text-gray-500">
//                           {provider.notes}
//                         </div>
//                         <ProfessorEventsDialog />

//                         {/* <div className="card-actions mx-auto mt-auto justify-end">
//                       <Link
//                         href={`https://scheduler.studyshuttle.mk/index.php?provider=${provider.id}&service=${service.id}`}
//                         className="btn btn-primary mt-5"
//                       >
//                         Book Class
//                       </Link>
//                     </div> */}
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
//               ),
//           )}
//           <div className="divider"></div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <main>
//       {supabaseStillLoading ? (
//         <div className="spinner"></div>
//       ) : userEducationClasses ? (
//         <Courses />
//       ) : (
//         <EditProfile
//           educationLevels={educationLevels}
//           userRoles={userRoles}
//           userRole={userRole}
//           supabaseConnection={supabaseConnection}
//         />
//       )}
//     </main>
//   );
// }
